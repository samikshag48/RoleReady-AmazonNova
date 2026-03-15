import { useState, useEffect } from 'react';
import { ExtensionMessage } from '../types';

export function useMessaging() {
  const [lastMessage, setLastMessage] = useState<ExtensionMessage | null>(null);

  useEffect(() => {
    const handleMessage = (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      setLastMessage(message);
      
      // Handle specific message types
      switch (message.type) {
        case 'JD_SCANNED':
          // This will trigger re-renders in components listening to lastMessage
          break;
        case 'ERROR':
          console.error('Extension error:', message.payload);
          break;
      }
      
      sendResponse({ success: true });
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const sendMessage = async (message: ExtensionMessage): Promise<any> => {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const sendToTab = async (tabId: number, message: ExtensionMessage): Promise<any> => {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      console.error('Failed to send message to tab:', error);
      throw error;
    }
  };

  const scanCurrentPage = async (): Promise<void> => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await sendToTab(tab.id, { type: 'SCAN_JD' });
      }
    } catch (error) {
      console.error('Failed to scan current page:', error);
      throw error;
    }
  };

  return {
    lastMessage,
    sendMessage,
    sendToTab,
    scanCurrentPage
  };
}