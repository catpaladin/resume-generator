/**
 * Secure Storage Service
 *
 * Provides encrypted storage for sensitive data like API keys using browser's
 * Web Crypto API. This is more secure than plain localStorage but still has
 * limitations in a browser environment.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// Storage keys
const ENCRYPTED_DATA_KEY = "encrypted-api-keys";
const SALT_KEY = "crypto-salt";

class SecureStorage {
  private cryptoKey: CryptoKey | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = this.checkCryptoSupport();
  }

  private checkCryptoSupport(): boolean {
    return (
      typeof window !== "undefined" &&
      "crypto" in window &&
      "subtle" in window.crypto &&
      typeof window.crypto.subtle.encrypt === "function"
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
      salt = Array.from(saltBuffer)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      localStorage.setItem(SALT_KEY, salt);
    }

    // Create a password-based key derivation
    // Note: In a real app, you'd want to prompt for a master password
    // For now, we'll use a combination of browser fingerprinting and a static key
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.getBrowserFingerprint() + salt),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"],
    );

    this.cryptoKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ["encrypt", "decrypt"],
    );

    return this.cryptoKey;
  }

  /**
   * Simple browser fingerprinting for key derivation
   */
  private getBrowserFingerprint(): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx!.textBaseline = "top";
    ctx!.font = "14px Arial";
    ctx!.fillText("Browser fingerprint", 2, 2);

    return [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ]
      .join("|")
      .slice(0, 100); // Limit length
  }

  /**
   * Encrypt and store sensitive data
   */
  async setSecure(key: string, value: string): Promise<void> {
    console.log(
      `[SecureStorage.setSecure] Starting encryption for key: ${key}`,
    );

    if (!this.isSupported) {
      console.warn(
        "Secure storage not supported, falling back to localStorage",
      );
      localStorage.setItem(key, value);
      console.log(
        `[SecureStorage.setSecure] Stored in plain localStorage for key: ${key}`,
      );
      return;
    }

    try {
      console.log(`[SecureStorage.setSecure] Getting crypto key...`);
      const cryptoKey = await this.getOrCreateKey();
      console.log(`[SecureStorage.setSecure] Got crypto key, generating IV...`);

      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

      console.log(`[SecureStorage.setSecure] Encrypting data...`);
      const encryptedData = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        cryptoKey,
        new TextEncoder().encode(value),
      );

      const encryptedArray = new Uint8Array(encryptedData);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);

      const encryptedBase64 = btoa(String.fromCharCode(...combined));

      console.log(`[SecureStorage.setSecure] Getting existing store...`);
      // Store encrypted data
      const existingData = this.getEncryptedStore();
      existingData[key] = encryptedBase64;

      console.log(`[SecureStorage.setSecure] Saving to localStorage...`);
      localStorage.setItem(ENCRYPTED_DATA_KEY, JSON.stringify(existingData));
      console.log(
        `[SecureStorage.setSecure] Successfully encrypted and stored key: ${key}`,
      );
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to securely store data");
    }
  }

  /**
   * Decrypt and retrieve sensitive data
   */
  async getSecure(key: string): Promise<string | null> {
    console.log(
      `[SecureStorage.getSecure] Starting decryption for key: ${key}`,
    );

    if (!this.isSupported) {
      console.log(
        `[SecureStorage.getSecure] Secure storage not supported, using localStorage`,
      );
      const value = localStorage.getItem(key);
      console.log(
        `[SecureStorage.getSecure] Retrieved from localStorage:`,
        value ? "Found" : "Not found",
      );
      return value;
    }

    try {
      console.log(`[SecureStorage.getSecure] Getting encrypted store...`);
      const encryptedStore = this.getEncryptedStore();
      const encryptedBase64 = encryptedStore[key];

      if (!encryptedBase64) {
        console.log(
          `[SecureStorage.getSecure] No encrypted data found for key: ${key}`,
        );
        return null;
      }

      console.log(
        `[SecureStorage.getSecure] Found encrypted data, getting crypto key...`,
      );
      const cryptoKey = await this.getOrCreateKey();

      console.log(`[SecureStorage.getSecure] Decoding base64 data...`);
      const combined = new Uint8Array(
        atob(encryptedBase64)
          .split("")
          .map((char) => char.charCodeAt(0)),
      );

      const iv = combined.slice(0, IV_LENGTH);
      const encryptedData = combined.slice(IV_LENGTH);

      console.log(`[SecureStorage.getSecure] Decrypting data...`);
      const decryptedData = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        cryptoKey,
        encryptedData,
      );

      const result = new TextDecoder().decode(decryptedData);
      console.log(
        `[SecureStorage.getSecure] Successfully decrypted key: ${key}`,
      );
      return result;
    } catch (error) {
      console.error("Decryption failed:", error);

      // Try to recover by clearing corrupted data and regenerating key
      try {
        console.warn("Attempting to recover from decryption failure...");
        await this.clearCorruptedData();
        return null; // Return null so user can re-enter their API key
      } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
        return null;
      }
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
   * Clear corrupted encryption data and reset crypto key
   */
  private async clearCorruptedData(): Promise<void> {
    console.warn("Clearing corrupted encryption data...");
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
        method: "AES-GCM encryption with PBKDF2 key derivation",
        limitations: [
          "Data is encrypted but stored in browser local storage",
          "Vulnerable if device is compromised or shared",
          "Browser extensions may have access to encrypted data",
          "Consider using environment variables for production",
        ],
      };
    } else {
      return {
        isSecure: false,
        method: "Plain text localStorage (fallback)",
        limitations: [
          "API keys stored in plain text",
          "Visible to anyone with device access",
          "Browser extensions can read the data",
          "Not recommended for production use",
        ],
      };
    }
  }
}

export const secureStorage = new SecureStorage();

// Helper functions for common operations
export const storeApiKey = async (provider: string, apiKey: string) => {
  console.log(`[SecureStorage] Storing API key for provider: ${provider}`);
  try {
    await secureStorage.setSecure(`api-key-${provider}`, apiKey);
    console.log(`[SecureStorage] Successfully stored API key for ${provider}`);
  } catch (error) {
    console.error(
      `[SecureStorage] Failed to store API key for ${provider}:`,
      error,
    );
    throw error;
  }
};

export const getApiKey = async (provider: string) => {
  console.log(`[SecureStorage] Retrieving API key for provider: ${provider}`);
  try {
    const apiKey = await secureStorage.getSecure(`api-key-${provider}`);
    console.log(
      `[SecureStorage] Retrieved API key for ${provider}:`,
      apiKey ? `Found (${apiKey.length} chars)` : "Not found",
    );
    return apiKey;
  } catch (error) {
    console.error(
      `[SecureStorage] Failed to retrieve API key for ${provider}:`,
      error,
    );
    return null;
  }
};

export const removeApiKey = (provider: string) =>
  secureStorage.removeSecure(`api-key-${provider}`);

export const clearAllSecureData = () => secureStorage.clearAll();

export const isSecureStorageSupported = () =>
  secureStorage.isSecureStorageSupported();
