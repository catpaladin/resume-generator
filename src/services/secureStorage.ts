/**
 * Secure Storage Service
 * 
 * Provides encrypted storage for sensitive data like API keys using browser's
 * Web Crypto API. This is more secure than plain localStorage but still has
 * limitations in a browser environment.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// Storage keys
const ENCRYPTED_DATA_KEY = 'encrypted-api-keys';
const SALT_KEY = 'crypto-salt';

class SecureStorage {
  private cryptoKey: CryptoKey | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = this.checkCryptoSupport();
  }

  private checkCryptoSupport(): boolean {
    return (
      typeof window !== 'undefined' &&
      'crypto' in window &&
      'subtle' in window.crypto &&
      typeof window.crypto.subtle.encrypt === 'function'
    );
  }

  /**
   * Initialize or retrieve the encryption key
   */
  private async getOrCreateKey(): Promise<CryptoKey> {
    if (this.cryptoKey) {
      return this.cryptoKey;
    }

    let salt = localStorage.getItem(SALT_KEY);
    
    if (!salt) {
      // Generate new salt
      const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
      salt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(SALT_KEY, salt);
    }

    // Create a password-based key derivation
    // Note: In a real app, you'd want to prompt for a master password
    // For now, we'll use a combination of browser fingerprinting and a static key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.getBrowserFingerprint() + salt),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    this.cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );

    return this.cryptoKey;
  }

  /**
   * Simple browser fingerprinting for key derivation
   */
  private getBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Browser fingerprint', 2, 2);
    
    return [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|').slice(0, 100); // Limit length
  }

  /**
   * Encrypt and store sensitive data
   */
  async setSecure(key: string, value: string): Promise<void> {
    if (!this.isSupported) {
      console.warn('Secure storage not supported, falling back to localStorage');
      localStorage.setItem(key, value);
      return;
    }

    try {
      const cryptoKey = await this.getOrCreateKey();
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        cryptoKey,
        new TextEncoder().encode(value)
      );

      const encryptedArray = new Uint8Array(encryptedData);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);

      const encryptedBase64 = btoa(String.fromCharCode(...combined));
      
      // Store encrypted data
      const existingData = this.getEncryptedStore();
      existingData[key] = encryptedBase64;
      localStorage.setItem(ENCRYPTED_DATA_KEY, JSON.stringify(existingData));
      
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to securely store data');
    }
  }

  /**
   * Decrypt and retrieve sensitive data
   */
  async getSecure(key: string): Promise<string | null> {
    if (!this.isSupported) {
      return localStorage.getItem(key);
    }

    try {
      const encryptedStore = this.getEncryptedStore();
      const encryptedBase64 = encryptedStore[key];
      
      if (!encryptedBase64) {
        return null;
      }

      const cryptoKey = await this.getOrCreateKey();
      const combined = new Uint8Array(
        atob(encryptedBase64)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, IV_LENGTH);
      const encryptedData = combined.slice(IV_LENGTH);

      const decryptedData = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        cryptoKey,
        encryptedData
      );

      return new TextDecoder().decode(decryptedData);
      
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Remove securely stored data
   */
  async removeSecure(key: string): Promise<void> {
    if (!this.isSupported) {
      localStorage.removeItem(key);
      return;
    }

    const encryptedStore = this.getEncryptedStore();
    delete encryptedStore[key];
    
    if (Object.keys(encryptedStore).length === 0) {
      localStorage.removeItem(ENCRYPTED_DATA_KEY);
    } else {
      localStorage.setItem(ENCRYPTED_DATA_KEY, JSON.stringify(encryptedStore));
    }
  }

  /**
   * Clear all securely stored data
   */
  async clearAll(): Promise<void> {
    localStorage.removeItem(ENCRYPTED_DATA_KEY);
    localStorage.removeItem(SALT_KEY);
    this.cryptoKey = null;
  }

  /**
   * Get the encrypted data store
   */
  private getEncryptedStore(): Record<string, string> {
    try {
      const stored = localStorage.getItem(ENCRYPTED_DATA_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Check if secure storage is available
   */
  isSecureStorageSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get security information for display to user
   */
  getSecurityInfo(): {
    isSecure: boolean;
    method: string;
    limitations: string[];
  } {
    if (this.isSupported) {
      return {
        isSecure: true,
        method: 'AES-GCM encryption with PBKDF2 key derivation',
        limitations: [
          'Data is encrypted but stored in browser local storage',
          'Vulnerable if device is compromised or shared',
          'Browser extensions may have access to encrypted data',
          'Consider using environment variables for production'
        ]
      };
    } else {
      return {
        isSecure: false,
        method: 'Plain text localStorage (fallback)',
        limitations: [
          'API keys stored in plain text',
          'Visible to anyone with device access',
          'Browser extensions can read the data',
          'Not recommended for production use'
        ]
      };
    }
  }
}

export const secureStorage = new SecureStorage();

// Helper functions for common operations
export const storeApiKey = (provider: string, apiKey: string) => 
  secureStorage.setSecure(`api-key-${provider}`, apiKey);

export const getApiKey = (provider: string) => 
  secureStorage.getSecure(`api-key-${provider}`);

export const removeApiKey = (provider: string) => 
  secureStorage.removeSecure(`api-key-${provider}`);