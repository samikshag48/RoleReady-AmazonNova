# RoleReady - AI-Powered Job Application Autopilot

> Built for the Amazon Nova Hackathon | Powered by AWS Bedrock

RoleReady is a Chrome extension + web app that helps students and job seekers tailor their resumes to specific job postings using Amazon Nova AI. Instead of spending hours rewriting your resume for every application, RoleReady does it in seconds.

I built this because applying to internships is genuinely exhausting. You are submitting to dozens of companies, each with slightly different requirements, and it is nearly impossible to customize every application. I wanted to build something that actually solves that problem using real AI, not just keyword matching.

---

## What It Does

- **Job Description Extraction** - paste any job posting URL and RoleReady scrapes and cleans the job description automatically using BeautifulSoup + Amazon Nova
- **Fit Score** - uses Amazon Nova Multimodal Embeddings to compute a cosine similarity score between your resume and the job description, giving you a percentage match with an explanation
- **Resume Tailoring** - uses Amazon Nova Lite to rewrite your resume to better align with the job requirements, skills, and language
- **Chrome Extension** - a popup UI that lives in your browser so you can scan jobs as you browse

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Models | Amazon Nova Lite (amazon.nova-lite-v1:0) |
| Embeddings | Amazon Nova Multimodal Embeddings (amazon.nova-2-multimodal-embeddings-v1:0) |
| AI Platform | AWS Bedrock |
| Backend | Python + Flask |
| Frontend | React + TypeScript + Vite |
| Extension | Chrome Manifest V3 |
| Scraping | BeautifulSoup + requests |

---

## How to Run It

### Prerequisites
- Python 3.8+
- Node.js 16+
- AWS account with Bedrock access enabled
- AWS credentials configured via aws configure

### 1. Clone and set up
```bash
git clone https://github.com/samikshag48/RoleReady-AmazonNova.git
cd RoleReady-AmazonNova
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure AWS
```bash
aws configure
# Set region to us-east-1
# Enable Nova models in AWS Bedrock console under Model Access
```

### 3. Start the backend
```bash
python app.py
```

### 4. Open the demo

Go to http://127.0.0.1:5000 in Chrome.

---

## Demo

1. Start Flask: python app.py
2. Open http://127.0.0.1:5000 in Chrome
3. Paste any job description in the left column
4. Paste your resume in the right column
5. Click Get Fit Score to see your match percentage
6. Click Tailor Resume to get an AI-rewritten version

Note: Sites that require login (LinkedIn, Workday) cannot be scraped automatically. Paste the job description text directly for those.

---

## API Endpoints

### POST /extract-job
```json
Request:  { "url": "https://example.com/jobs/123" }
Response: { "job_description": "cleaned text...", "raw_job_description": "raw text..." }
```

### POST /fit-score
```json
Request:  { "resume": "your resume text", "job_description": "job description text" }
Response: { "score": 78, "label": "Strong Match", "explanation": "..." }
```

### POST /edit-resume
```json
Request:  { "resume": "your resume text", "job_description": "job description text" }
Response: { "tailored_resume": "rewritten resume..." }
```

---

## How the AI Works

Nova Multimodal Embeddings converts both resume and job description into 1024-dimensional vectors, then computes cosine similarity. Nova Lite rewrites the resume to better match the job language and requirements.
```python
resume_embedding = get_embedding(resume_text)
jd_embedding = get_embedding(job_description)
similarity = cosine_similarity(resume_embedding, jd_embedding)
score = round((similarity + 1) / 2 * 100)
```

---

## Requirements
```
Flask==3.0.0
flask-cors==4.0.0
werkzeug==3.0.1
boto3
beautifulsoup4
requests
numpy
pdfplumber==0.10.0
```

---

## License

Built for educational and hackathon purposes.
