import React from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingScanButton } from './components/content/FloatingScanButton';
import { JDModal } from './components/content/JDModal';
import { JDParser } from './lib/parsers';
import { JobDescription } from './types';

// Content script runs on job pages to detect and parse job descriptions
class ContentScript {
  private shadowRoot: ShadowRoot | null = null;
  private isScanning = false;
  private parsedJD: Partial<JobDescription> | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    } else {
      this.setupUI();
    }

    // Listen for messages from background script
    window.addEventListener('message', this.handleMessage.bind(this));
    chrome.runtime.onMessage.addListener(this.handleExtensionMessage.bind(this));
  }

  private setupUI() {
    if (!this.shouldShowOnPage()) return;

    // Create shadow DOM container
    const container = document.createElement('div');
    container.id = 'roleready-extension-root';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999999;
      pointer-events: none;
    `;

    this.shadowRoot = container.attachShadow({ mode: 'open' });
    
    // Add styles to shadow DOM
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      * {
        box-sizing: border-box;
      }
      
      .floating-button {
        pointer-events: auto;
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #5B6CFF;
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(91, 108, 255, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .floating-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(91, 108, 255, 0.4);
        background: #4C5EFF;
      }
      
      .floating-button.scanning {
        background: #06B6D4;
        cursor: not-allowed;
      }
      
      .floating-button.success {
        background: #10B981;
      }
      
      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        pointer-events: auto;
      }
      
      .modal-content {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 600px;
        width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      }
      
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      
      .modal-title {
        font-size: 20px;
        font-weight: 600;
        color: #0F172A;
        margin: 0;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748B;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .job-info {
        margin-bottom: 20px;
      }
      
      .job-title {
        font-size: 18px;
        font-weight: 600;
        color: #0F172A;
        margin-bottom: 8px;
      }
      
      .job-meta {
        color: #64748B;
        font-size: 14px;
        margin-bottom: 16px;
      }
      
      .section {
        margin-bottom: 20px;
      }
      
      .section-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .tag {
        background: #EEF2FF;
        color: #5B6CFF;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .bullet-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .bullet-list li {
        padding: 4px 0;
        color: #374151;
        font-size: 14px;
      }
      
      .bullet-list li::before {
        content: "•";
        color: #5B6CFF;
        margin-right: 8px;
      }
      
      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }
      
      .btn {
        padding: 10px 16px;
        border-radius: 8px;
        border: none;
        font-weight: 500;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background: #5B6CFF;
        color: white;
      }
      
      .btn-primary:hover {
        background: #4C5EFF;
      }
      
      .btn-secondary {
        background: #F1F5F9;
        color: #64748B;
        border: 1px solid #E2E8F0;
      }
      
      .btn-secondary:hover {
        background: #E2E8F0;
      }
    `;
    
    this.shadowRoot.appendChild(styleSheet);
    
    // Create React root
    const reactRoot = document.createElement('div');
    this.shadowRoot.appendChild(reactRoot);
    
    const root = createRoot(reactRoot);
    root.render(React.createElement(ContentUI, {
      onScan: () => this.scanJobDescription(),
      isScanning: this.isScanning,
      parsedJD: this.parsedJD,
      onSendToPoup: (jd: JobDescription) => this.sendJobDescriptionToPopup(jd),
      onClose: () => this.closModal()
    }));

    document.body.appendChild(container);
  }

  private shouldShowOnPage(): boolean {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Show on LinkedIn job pages
    if (hostname.includes('linkedin.com') && url.includes('/jobs/')) {
      return true;
    }
    
    // Show on common job sites
    const jobSiteKeywords = ['career', 'job', 'position', 'hiring', 'apply', 'employment'];
    const hasJobKeywords = jobSiteKeywords.some(keyword => 
      url.toLowerCase().includes(keyword) || 
      document.title.toLowerCase().includes(keyword)
    );
    
    // Also check for common job-related elements on the page
    const hasJobElements = !!(
      document.querySelector('[class*="job"]') ||
      document.querySelector('[class*="career"]') ||
      document.querySelector('[class*="position"]') ||
      document.querySelector('[data-testid*="job"]')
    );
    
    return hasJobKeywords || hasJobElements;
  }

  private async scanJobDescription() {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.updateUI();

    try {
      // Detect site type and parse accordingly
      const hostname = window.location.hostname;
      let parsed: Partial<JobDescription>;

      if (hostname.includes('linkedin.com')) {
        parsed = JDParser.parseLinkedIn(document);
      } else {
        parsed = JDParser.parseGeneric(document);
      }

      // Create full job description
      const jobDescription = JDParser.createJobDescription(parsed);
      this.parsedJD = jobDescription;

      this.updateUI();
    } catch (error) {
      console.error('Failed to scan job description:', error);
      this.showError('Failed to scan job description. Please try again.');
    } finally {
      this.isScanning = false;
    }
  }

  private async sendJobDescriptionToPopup(jd: JobDescription) {
    try {
      await chrome.runtime.sendMessage({
        type: 'JD_SCANNED',
        payload: jd
      });
      
      this.showSuccess();
      setTimeout(() => this.closModal(), 1500);
    } catch (error) {
      console.error('Failed to send job description:', error);
      this.showError('Failed to send data to extension. Please try again.');
    }
  }

  private handleMessage(event: MessageEvent) {
    if (event.data?.type === 'ROLEREADY_SCAN_REQUEST') {
      this.scanJobDescription();
    } else if (event.data?.type === 'ROLEREADY_SCAN_SELECTION') {
      this.scanSelection(event.data.text);
    }
  }

  private handleExtensionMessage(message: any, sender: any, sendResponse: any) {
  if (message.type === 'SCAN_JD') {
    this.scanJobDescription();
    // Important: sendResponse lets the background know we got the signal
    sendResponse({ success: true });
  }
}

  private async scanSelection(selectedText: string) {
    const jobDescription = JDParser.createJobDescription({
      title: 'Selected Text',
      company: 'Unknown',
      location: 'Unknown',
      rawText: selectedText,
      source: 'manual'
    });

    this.parsedJD = jobDescription;
    this.updateUI();
  }

  private updateUI() {
    // This would trigger React re-render in a real implementation
    // For now, we'll rely on the React component state management
  }

  private showSuccess() {
    console.log('Job description sent successfully!');
  }

  private showError(message: string) {
    console.error(message);
  }

  private closModal() {
    this.parsedJD = null;
    this.updateUI();
  }
}

// React component for the content script UI
interface ContentUIProps {
  onScan: () => void;
  isScanning: boolean;
  parsedJD: Partial<JobDescription> | null;
  onSendToPoup: (jd: JobDescription) => void;
  onClose: () => void;
}

function ContentUI({ onScan, isScanning, parsedJD, onSendToPoup, onClose }: ContentUIProps) {
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    setShowModal(!!parsedJD);
  }, [parsedJD]);

  return (
    <>
      <button 
        className={`floating-button ${isScanning ? 'scanning' : ''}`}
        onClick={onScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <div className="spinner" />
            Scanning...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="7.5,12 12,16.5 16.5,12"/>
              <line x1="12" y1="7.5" x2="12" y2="16.5"/>
            </svg>
            Scan JD with RoleReady
          </>
        )}
      </button>

      {showModal && parsedJD && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Job Description Scanned</h2>
              <button className="close-button" onClick={onClose}>×</button>
            </div>

            <div className="job-info">
              <div className="job-title">{parsedJD.title}</div>
              <div className="job-meta">
                {parsedJD.company} • {parsedJD.location}
                {parsedJD.seniority && ` • ${parsedJD.seniority} Level`}
              </div>
            </div>

            {parsedJD.skills && parsedJD.skills.length > 0 && (
              <div className="section">
                <div className="section-title">Skills & Technologies</div>
                <div className="tag-list">
                  {parsedJD.skills.map((skill, index) => (
                    <span key={index} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {parsedJD.responsibilities && parsedJD.responsibilities.length > 0 && (
              <div className="section">
                <div className="section-title">Key Responsibilities</div>
                <ul className="bullet-list">
                  {parsedJD.responsibilities.slice(0, 4).map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedJD.requirements && parsedJD.requirements.length > 0 && (
              <div className="section">
                <div className="section-title">Requirements</div>
                <ul className="bullet-list">
                  {parsedJD.requirements.slice(0, 4).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="button-group">
              <button 
                className="btn btn-primary"
                onClick={() => onSendToPoup(parsedJD as JobDescription)}
              >
                Send to RoleReady
              </button>
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ContentScript();
  });
} else {
  new ContentScript();
}