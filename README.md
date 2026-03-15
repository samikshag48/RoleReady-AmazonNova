# 🎯 RoleReady — AI-Powered Job Application Autopilot

> Built for the Amazon Nova Hackathon | Powered by AWS Bedrock

RoleReady is a Chrome extension + web app that helps students and job seekers tailor their resumes to specific job postings using Amazon Nova AI. Instead of spending hours rewriting your resume for every application, RoleReady does it in seconds — it scans the job description, scores how well your resume matches, and rewrites it to highlight the most relevant parts.

I built this because applying to internships is genuinely exhausting. You're submitting to dozens of companies, each with slightly different requirements, and it's nearly impossible to customize every application. I wanted to build something that actually solves that problem using real AI, not just keyword matching.

---

## What It Does

- **📄 Job Description Extraction** — paste any job posting URL and RoleReady scrapes and cleans the job description automatically using BeautifulSoup + Amazon Nova
- **⚡ Fit Score** — uses Amazon Nova Multimodal Embeddings to compute a cosine similarity score between your resume and the job description, giving you a percentage match with an explanation
- **✨ Resume Tailoring** — uses Amazon Nova Lite to rewrite your resume to better align with the job's requirements, skills, and language
- **🔌 Chrome Extension** — a popup UI that lives in your browser so you can scan jobs as you browse

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Models | Amazon Nova Lite (`amazon.nova-lite-v1:0`) |
| Embeddings | Amazon Nova Multimodal Embeddings (`amazon.nova-2-multimodal-embeddings-v1:0`) |
| AI Platform | AWS Bedrock |
| Backend | Python + Flask |
| Frontend | React + TypeScript + Vite |
| Extension | Chrome Manifest V3 |
| Scraping | BeautifulSoup + requests |

---

## Project Structure

```
RoleReady/
├── app.py                  # Flask backend — all API endpoints
├── JDextraction.py         # Web scraper for job descriptions
├── requirements.txt        # Python dependencies
├── static/
│   └── demo.html           # Web demo (accessible at http://127.0.0.1:5000)
└── frontend/
    ├── src/
    │   ├── background.ts         # Chrome service worker + API proxy
    │   ├── content-script.tsx    # Injected page button
    │   ├── lib/apiService.ts     # API calls via background worker
    │   ├── popup/tabs/
    │   │   ├── ScanTab.tsx       # URL extractor UI
    │   │   ├── ResumeTab.tsx     # Resume editor + fit score UI
    │   │   └── ProfileTab.tsx    # User profile
    │   └── types/index.ts        # TypeScript types
    ├── public/manifest.json      # Chrome extension manifest
    ├── vite.config.ts            # Main build config
    └── vite.config.cs.ts         # Content script IIFE build
```

---

## How to Run It

### Prerequisites
- Python 3.8+
- Node.js 16+
- AWS account with Bedrock access enabled
- AWS credentials configured (`aws configure`)

### 1. Clone and set up the backend

```bash
git clone <your-repo-url>
cd RoleReady

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Make sure AWS credentials are configured

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and set region to us-east-1
```

You also need to enable Amazon Nova models in the AWS Bedrock console under **Model Access**.

### 3. Start the Flask backend

```bash
python app.py
```

The server starts at `http://127.0.0.1:5000`

### 4. Open the web demo

Go to `http://127.0.0.1:5000` in Chrome — you'll see the full demo UI where you can paste a job description and your resume to test everything out.

### 5. (Optional) Build and load the Chrome extension

```bash
cd frontend
npm install
npm run build
```

Then in Chrome:
- Go to `chrome://extensions`
- Enable Developer Mode
- Click "Load unpacked" → select the `frontend/dist` folder

---

## API Endpoints

All endpoints are on `http://127.0.0.1:5000`

### `POST /extract-job`
Scrapes a job posting URL and uses Nova to clean + summarize the description.

```json
Request:  { "url": "https://example.com/jobs/123" }
Response: { "job_description": "cleaned text...", "raw_job_description": "raw text..." }
```

### `POST /fit-score`
Generates embeddings for both resume and job description using Nova Multimodal Embeddings, then computes cosine similarity.

```json
Request:  { "resume": "your resume text", "job_description": "job description text" }
Response: { "score": 78, "label": "Strong Match", "explanation": "Your Python and data skills align well..." }
```

### `POST /edit-resume`
Uses Nova Lite to rewrite your resume tailored to the job description.

```json
Request:  { "resume": "your resume text", "job_description": "job description text" }
Response: { "tailored_resume": "rewritten resume..." }
```

### `POST /upload-resume`
Same as `/edit-resume` but accepts a PDF or TXT file upload instead of raw text.

---

## How the AI Works

### Fit Scoring with Nova Embeddings
The fit score uses Amazon Nova Multimodal Embeddings (`amazon.nova-2-multimodal-embeddings-v1:0`) to convert both the resume and job description into 1024-dimensional vectors, then computes cosine similarity between them. A higher similarity means your resume language and skills are closer to what the job is looking for.

```python
resume_embedding = get_embedding(resume_text)     # 1024-dim vector
jd_embedding = get_embedding(job_description)     # 1024-dim vector
similarity = cosine_similarity(resume_embedding, jd_embedding)
score = round((similarity + 1) / 2 * 100)  # normalize to 0-100%
```

### Resume Tailoring with Nova Lite
The tailoring prompt sends both the original resume and the job description to `amazon.nova-lite-v1:0` and asks it to rewrite the resume to better highlight relevant experience, use matching keywords, and align with the role's requirements.

### Job Description Extraction
The scraper uses BeautifulSoup to pull the largest text block from any job posting page. The raw text is then cleaned by Nova to extract only the relevant parts — responsibilities, qualifications, and required skills — removing boilerplate like benefits descriptions and EEO statements.

---

## Demo

The easiest way to demo this:

1. Start Flask: `python app.py`
2. Open `http://127.0.0.1:5000` in Chrome
3. Paste any job description in the left column
4. Paste your resume in the right column
5. Click **⚡ Get Fit Score** to see your match percentage
6. Click **✨ Tailor Resume** to get an AI-rewritten version

---

## Challenges I Ran Into

Honestly this project had a lot of unexpected challenges. The biggest one was getting the Chrome extension to communicate with the Flask backend. Chrome MV3 service workers have strict rules about fetching from localhost — I spent a long time debugging 403 errors before figuring out that requests needed to be proxied through the background service worker with the right CORS headers (`Access-Control-Allow-Private-Network: true`).

The other big challenge was that most job sites (LinkedIn, Workday) either require login or actively block scrapers, so the URL extraction feature works best on company career pages rather than aggregator sites.

---

## Future Ideas

- **Nova Act integration** — use Nova Act to auto-fill and submit job applications directly
- **LinkedIn scraping** — use a headless browser to handle login-walled job sites
- **Application tracker** — save and track which jobs you've applied to and your fit scores
- **Cover letter generation** — use Nova to generate tailored cover letters too
- **Resume templates** — export the tailored resume as a formatted PDF

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

Built for educational and hackathon purposes. Please respect the terms of service of any job sites you use this with.
