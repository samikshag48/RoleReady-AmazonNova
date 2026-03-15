import { ExtensionMessage } from './types';
import { StorageService } from './lib/storage';

// Service worker for Chrome Extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('RoleReady extension installed');
  
  // Set default settings on first install
  const settings = await StorageService.getAppSettings();
  if (!settings.onboardingCompleted) {
    await StorageService.saveAppSettings({
      ...settings,
      theme: 'system'
    });
  }
});

// Handle messages between different parts of the extension
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender,
  sendResponse
) => {
  console.log('Background received message:', message.type);

  switch (message.type) {
    case 'GET_PROFILE':
      // Return user profile data
      handleGetProfile(sendResponse);
      return true; // Keep the message channel open for async response

    case 'GET_JD':
      // Return current job description
      handleGetJobDescription(sendResponse);
      return true; // Keep the message channel open for async response

    case 'JD_SCANNED':
      // Relay job description data to popup
      handleJobDescriptionScanned(message.payload, sender.tab?.id);
      break;

    case 'SCAN_JD':
      // Trigger scanning on current tab
      handleScanRequest(sender.tab?.id);
      break;
    case 'API_REQUEST':
      handleApiRequest(message.endpoint, message.payload, sendResponse);
      return true;

    case 'ERROR':
      console.error('Extension error:', message.payload);
      break;
  }

  sendResponse({ success: true });
});

async function handleGetProfile(sendResponse: (response: any) => void) {
  try {
    const profile = await StorageService.getUserProfile();
    sendResponse({ success: true, data: profile });
  } catch (error) {
    console.error('Failed to get profile:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

async function handleGetJobDescription(sendResponse: (response: any) => void) {
  try {
    const settings = await StorageService.getAppSettings();
    const jobDescriptions = await StorageService.getJobDescriptions();

    // Get the most recent job description if available
    const latestJD = jobDescriptions.length > 0 ? jobDescriptions[0] : null;
    sendResponse({ success: true, data: latestJD });
  } catch (error) {
    console.error('Failed to get job description:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

async function handleJobDescriptionScanned(jobDescription: any, tabId?: number) {
  try {
    // Save the job description
    await StorageService.saveJobDescription(jobDescription);

    // Update active job ID in settings
    const settings = await StorageService.getAppSettings();
    await StorageService.saveAppSettings({
      ...settings,
      lastActiveJobId: jobDescription.id
    });

    // Notify popup if open
    chrome.runtime.sendMessage({
      type: 'JD_SCANNED',
      payload: jobDescription
    }).catch(() => {
      // Popup might not be open, that's okay
    });

  } catch (error) {
    console.error('Failed to handle scanned job description:', error);
  }
}

// 1. Update handleScanRequest to use chrome.tabs.sendMessage instead of postMessage
async function handleScanRequest(tabId?: number) {
  if (!tabId) {
    // If no tabId (e.g. called from Popup), get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab?.id;
  }

  if (!tabId) return;

  try {
    // Send message directly to the content script already on the page
    chrome.tabs.sendMessage(tabId, { type: 'SCAN_JD' });
  } catch (error) {
    console.error('Failed to send scan request:', error);
  }
}

// 2. Note on handleApiRequest:
// Ensure your Flask /upload-resume endpoint is updated to accept JSON/Base64
// instead of multipart/form-data if you use the proxy for files.
async function handleApiRequest(endpoint: string, payload: any, sendResponse: (response: any) => void) {
  console.log('API_REQUEST to:', endpoint, payload);
  try {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    console.log('API_RESPONSE:', response.status, text);
    if (!text || text.trim() === '') {
      sendResponse({ success: false, error: 'Empty response from Flask' });
      return;
    }
    const data = JSON.parse(text);
    sendResponse({ success: true, data });
  } catch (error) {
    console.error('API_REQUEST FAILED:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // This is only called if no popup is defined
  // Since we have a popup, this won't be triggered normally
  console.log('Extension icon clicked');
});

// Context menu integration (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'scan-job-description',
    title: 'Scan with RoleReady',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'scan-job-description' && tab?.id) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedText) => {
        window.postMessage({
          type: 'ROLEREADY_SCAN_SELECTION',
          text: selectedText
        }, '*');
      },
      args: [info.selectionText]
    });
  }
});