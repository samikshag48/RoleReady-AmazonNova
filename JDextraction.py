import requests
from bs4 import BeautifulSoup
import re


def extract_job_description(url: str) -> str:
    """
    Extracts the main job description from a job posting page.
    Uses browser-like headers to avoid bot detection.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    response = requests.get(url, headers=headers, timeout=10)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch page. Status code: {response.status_code}")

    soup = BeautifulSoup(response.text, 'html.parser')

    # Remove noise elements first
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    # STRATEGY 1: Look for known job description container class/id names
    jd_selectors = [
        {"class": re.compile(r"job[-_]?description", re.I)},
        {"class": re.compile(r"description", re.I)},
        {"id": re.compile(r"job[-_]?description", re.I)},
        {"class": re.compile(r"posting[-_]?content", re.I)},
        {"class": re.compile(r"job[-_]?details", re.I)},
        {"class": re.compile(r"content[-_]?body", re.I)},
    ]

    for selector in jd_selectors:
        element = soup.find(["div", "section", "article"], selector)
        if element:
            text = element.get_text(separator="\n", strip=True)
            if len(text.split()) > 50:
                return clean_text(text)

    # STRATEGY 2: Fall back to largest meaningful text block
    blocks = []
    for tag in soup.find_all(["div", "section", "article"]):
        text = tag.get_text(separator="\n", strip=True)
        if len(text.split()) > 80:
            blocks.append(text)

    if not blocks:
        return "No valid job description found."

    job_text = max(blocks, key=len)
    return clean_text(job_text)


def clean_text(text: str) -> str:
    """Remove common boilerplate patterns from job descriptions."""
    patterns_to_remove = [
        r"Compensation and Benefits:.*",
        r"Summary Pay Range:.*",
        r"Posting Dates:.*",
        r"Equal Opportunity Employer.*",
        r"If you are interested in applying.*",
        r"Share.*Similar Jobs.*",
        r"Apply Now.*",
        r"Save Job.*",
    ]
    for pattern in patterns_to_remove:
        text = re.sub(pattern, "", text, flags=re.DOTALL | re.IGNORECASE)

    # Focus on role-specific content
    focus_keywords = [
        "responsibilities", "qualifications", "skills", "what does",
        "internship", "you'll", "requirements", "about the role",
        "what you'll do", "who you are", "what we're looking for"
    ]
    lines = text.splitlines()
    extracted = []
    capturing = False
    for line in lines:
        if any(kw.lower() in line.lower() for kw in focus_keywords):
            capturing = True
        if capturing:
            extracted.append(line)

    cleaned = "\n".join(extracted).strip()
    return cleaned if cleaned else text.strip()