import { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';

export function useStorageSync<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.sync.get(key);
        setValue(result[key] || defaultValue);
      } catch (error) {
        console.error(`Failed to load ${key} from storage:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  const updateValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await chrome.storage.sync.set({ [key]: newValue });
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
    }
  };

  return [value, updateValue, loading] as const;
}

export function useStorageLocal<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get(key);
        setValue(result[key] || defaultValue);
      } catch (error) {
        console.error(`Failed to load ${key} from storage:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  const updateValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await chrome.storage.local.set({ [key]: newValue });
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
    }
  };

  return [value, updateValue, loading] as const;
}

export function useDebouncedSave<T>(
  value: T,
  saveFunction: (value: T) => Promise<void>,
  delay: number = 1000
) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!value) return;

    setSaving(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        await saveFunction(value);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save:', error);
      } finally {
        setSaving(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, saveFunction, delay]);

  return { saving, lastSaved };
}