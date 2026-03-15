from flask import Flask, request, jsonify, make_response
from werkzeug.utils import secure_filename
import os, boto3, json, math

app = Flask(__name__)

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        resp.headers['Access-Control-Allow-Private-Network'] = 'true'
        return resp

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Private-Network'] = 'true'
    return response

app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

bedrock = boto3.client(service_name="bedrock-runtime", region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"))
NOVA_MODEL_ID = "amazon.nova-lite-v1:0"
EMBEDDINGS_MODEL_ID = "amazon.nova-2-multimodal-embeddings-v1:0"

def call_nova(system_prompt, user_prompt):
    body = {"messages": [{"role": "user", "content": [{"text": user_prompt}]}], "system": [{"text": system_prompt}], "inferenceConfig": {"temperature": 0.7, "maxTokens": 1000}}
    response = bedrock.invoke_model(modelId=NOVA_MODEL_ID, body=json.dumps(body), contentType="application/json", accept="application/json")
    return json.loads(response["body"].read())["output"]["message"]["content"][0]["text"]

def get_embedding(text):
    body = {"schemaVersion": "nova-multimodal-embed-v1", "taskType": "SINGLE_EMBEDDING", "singleEmbeddingParams": {"embeddingPurpose": "GENERIC_RETRIEVAL", "embeddingDimension": 1024, "text": {"truncationMode": "END", "value": text[:8000]}}}
    response = bedrock.invoke_model(body=json.dumps(body), modelId=EMBEDDINGS_MODEL_ID, contentType="application/json", accept="application/json")
    return json.loads(response["body"].read())["embeddings"][0]["embedding"]

def cosine_similarity(a, b):
    dot = sum(x*y for x,y in zip(a,b))
    return dot / (math.sqrt(sum(x*x for x in a)) * math.sqrt(sum(y*y for y in b)))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'txt', 'pdf'}

@app.route('/extract-job', methods=['POST', 'OPTIONS'])
def extract_job():
    data = request.get_json()
    url = data.get('url', '').strip()
    if not url:
        return jsonify({"error": "URL required"}), 400
    try:
        from JDextraction import extract_job_description
        raw_jd = extract_job_description(url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    try:
        cleaned = call_nova("You are a job description analyst. Return only role summary, responsibilities, required skills. Remove boilerplate.", f"Clean this job description:\n\n{raw_jd}")
        return jsonify({"job_description": cleaned, "raw_job_description": raw_jd})
    except Exception as e:
        return jsonify({"job_description": raw_jd, "warning": str(e)})

@app.route('/edit-resume', methods=['POST', 'OPTIONS'])
def edit_resume():
    data = request.get_json()
    resume = data.get('resume', '')
    job_description = data.get('job_description', '')
    if not resume or not job_description:
        return jsonify({"error": "Resume and job description required"}), 400
    try:
        result = call_nova("You are an expert resume writer. Create a detailed one page resume tailored to the job.", f"Edit this resume to match the job.\n\nResume:\n{resume}\n\nJob Description:\n{job_description}\n\nTailored Resume:")
        return jsonify({"tailored_resume": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload-resume', methods=['POST', 'OPTIONS'])
def upload_resume():
    upload_folder = 'uploads'
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    if 'file' not in request.files or 'job_description' not in request.form:
        return jsonify({"error": "File and job description required"}), 400
    file = request.files['file']
    job_description = request.form['job_description']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file"}), 400
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    if filename.endswith('.txt'):
        resume_text = open(filepath).read()
    else:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            resume_text = "\n".join([p.extract_text() for p in pdf.pages if p.extract_text()])
    os.remove(filepath)
    try:
        result = call_nova("You are an expert resume writer.", f"Edit this resume to match the job.\n\nResume:\n{resume_text}\n\nJob Description:\n{job_description}\n\nTailored Resume:")
        return jsonify({"tailored_resume": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/fit-score', methods=['POST', 'OPTIONS'])
def fit_score():
    data = request.get_json()
    resume = data.get('resume', '')
    job_description = data.get('job_description', '')
    if not resume or not job_description:
        return jsonify({"error": "Resume and job description required"}), 400
    try:
        resume_emb = get_embedding(resume)
        jd_emb = get_embedding(job_description)
        similarity = cosine_similarity(resume_emb, jd_emb)
        score = round((similarity + 1) / 2 * 100)
        labels = {85: "Excellent Match", 70: "Strong Match", 55: "Moderate Match"}
        label = next((v for k,v in labels.items() if score >= k), "Weak Match")
        explanation = call_nova("You are a resume analyst. Be concise, 2 sentences max.", f"Resume scored {score}% against this job. Resume: {resume[:400]} Job: {job_description[:400]}. Explain why and what to improve.")
        return jsonify({"score": score, "label": label, "explanation": explanation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def demo():
    return app.send_static_file('demo.html')

if __name__ == '__main__':
    app.run(debug=True)