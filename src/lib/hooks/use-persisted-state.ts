import { useState, useEffect } from 'react';
import type { ResumeData } from '@/components/resume/types';

const STORAGE_KEY = 'resume-data';

export function usePersistedState(initialState: ResumeData) {
  const [state, setState] = useState<ResumeData>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored resume data:', error);
      }
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}

export const exportResumeData = (data: ResumeData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resume-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importResumeData = async (file: File): Promise<ResumeData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Basic validation of imported data
        if (
          typeof data === 'object' &&
          'fullName' in data &&
          'experience' in data &&
          'education' in data
        ) {
          resolve(data as ResumeData);
        } else {
          reject(new Error('Invalid resume data format'));
        }
      } catch (error) {
        reject(new Error('Failed to parse resume data'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
