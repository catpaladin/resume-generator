/**
 * Models.dev Service
 *
 * Dynamically retrieves models and pricing estimates from models.dev
 */

export interface ModelsDevCost {
  input: number;
  output: number;
  cache_read?: number;
  cache_write?: number;
}

export interface ModelsDevLimit {
  context: number;
  output?: number;
}

export interface ModelsDevModel {
  id: string;
  name: string;
  cost: ModelsDevCost;
  limit: ModelsDevLimit;
  description?: string;
  isRecommended?: boolean;
}

export interface ModelsDevProvider {
  id: string;
  name: string;
  models: Record<string, ModelsDevModel>;
}

export type ModelsDevResponse = Record<string, ModelsDevProvider>;

const API_URL = "/api/ai/models-dev";
const STORAGE_KEY = "models-dev-data";
const LAST_FETCH_KEY = "models-dev-last-fetch";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

class ModelsDevService {
  private _data = $state<ModelsDevResponse | null>(null);
  private _lastFetch = $state<number>(0);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;

    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedLastFetch = localStorage.getItem(LAST_FETCH_KEY);

    if (storedData) {
      try {
        this._data = JSON.parse(storedData);
      } catch (e) {
        console.error("Failed to parse stored models.dev data", e);
      }
    }

    if (storedLastFetch) {
      this._lastFetch = parseInt(storedLastFetch, 10);
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;

    if (this._data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    }
    localStorage.setItem(LAST_FETCH_KEY, this._lastFetch.toString());
  }

  async fetchModels(force = false): Promise<ModelsDevResponse | null> {
    if (!force && this._data && Date.now() - this._lastFetch < CACHE_DURATION) {
      console.log("[ModelsDevService] Using cached data");
      return this._data;
    }

    console.log("[ModelsDevService] Fetching models from models.dev...");
    try {
      const response = await fetch(API_URL);
      if (!response.ok)
        throw new Error(`Failed to fetch models: ${response.status}`);

      const data = await response.json();
      console.log(
        "[ModelsDevService] Successfully fetched models for providers:",
        Object.keys(data).length,
      );
      this._data = data;
      this._lastFetch = Date.now();
      this.saveToStorage();
      return this._data;
    } catch (error) {
      console.error(
        "[ModelsDevService] Error fetching models from models.dev:",
        error,
      );
      return this._data; // Return cached data if fetch fails
    }
  }

  getProvider(providerId: string): ModelsDevProvider | null {
    if (!this._data) return null;

    // Map app provider IDs to models.dev provider IDs
    const mapping: Record<string, string> = {
      gemini: "google",
      google: "google",
      openai: "openai",
      anthropic: "anthropic",
      xai: "xai",
      deepseek: "deepseek",
      perplexity: "perplexity",
      mistral: "mistral",
      groq: "groq",
      cohere: "cohere",
    };

    const mappedId =
      mapping[providerId.toLowerCase()] || providerId.toLowerCase();
    return this._data[mappedId] || null;
  }

  getModelsForProvider(providerId: string) {
    const provider = this.getProvider(providerId);
    if (!provider) {
      console.log(
        `[ModelsDevService] No provider data found for: ${providerId}`,
      );
      return [];
    }

    const models = Object.values(provider.models)
      .filter((m) => m.cost && m.limit) // Ensure it has cost and limit data
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || `${m.name} from ${provider.name}`,
        context_length: m.limit.context,
        isRecommended: m.isRecommended || false,
      }));

    console.log(
      `[ModelsDevService] Found ${models.length} models for ${providerId}`,
    );
    return models;
  }

  getPricing(providerId: string, modelId: string) {
    const provider = this.getProvider(providerId);
    if (!provider) return null;

    const model = provider.models[modelId];
    if (!model) return null;

    return {
      inputCostPer1M: model.cost.input,
      outputCostPer1M: model.cost.output,
      contextWindow: model.limit.context,
    };
  }

  getLogoUrl(providerId: string): string {
    const mappedId = providerId === "gemini" ? "google" : providerId;
    return `/api/ai/logos/${mappedId}.svg`;
  }

  async refresh() {
    return this.fetchModels(true);
  }

  getLastFetchDate(): Date | null {
    return this._lastFetch ? new Date(this._lastFetch) : null;
  }

  isDataLoaded(): boolean {
    return !!this._data;
  }
}

export const modelsDevService = new ModelsDevService();
