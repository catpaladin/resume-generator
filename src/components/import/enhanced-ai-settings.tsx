import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/input";
import {
  Bot,
  Settings,
  Zap,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Clock,
  TrendingUp,
  DollarSign,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import type { AISettings } from "@/types/resume";
import {
  testAIConnection,
  estimateEnhancementCosts,
} from "@/lib/ai/ai-service";
import { modelService, type Model } from "@/services/modelService";

interface EnhancedAISettingsProps {
  onSettingsChange?: (settings: AISettings) => void;
  showAdvanced?: boolean;
  className?: string;
}

interface ProviderInfo {
  name: string;
  description: string;
  strengths: string[];
  pricing: string;
  speed: "fast" | "medium" | "slow";
  quality: "high" | "medium" | "low";
}

const PROVIDER_INFO: Record<string, ProviderInfo> = {
  openai: {
    name: "OpenAI GPT",
    description:
      "Industry-leading language model with excellent resume enhancement capabilities",
    strengths: ["Natural language", "Professional tone", "Industry knowledge"],
    pricing: "Low cost",
    speed: "fast",
    quality: "high",
  },
  anthropic: {
    name: "Claude",
    description:
      "Advanced reasoning with strong ethical guidelines and detailed analysis",
    strengths: [
      "Thoughtful analysis",
      "Detailed reasoning",
      "Conservative suggestions",
    ],
    pricing: "Medium cost",
    speed: "medium",
    quality: "high",
  },
  gemini: {
    name: "Google Gemini",
    description:
      "Google's latest model with strong factual accuracy and broad knowledge",
    strengths: ["Factual accuracy", "Technical roles", "Broad knowledge base"],
    pricing: "Low cost",
    speed: "fast",
    quality: "medium",
  },
};

export function EnhancedAISettings({
  onSettingsChange,
  showAdvanced = true,
  className = "",
}: EnhancedAISettingsProps) {
  const { aiSettings, setAISettings } = useResumeStore();
  const [formData, setFormData] = useState<AISettings>(
    aiSettings || {
      provider: "openai",
      model: "",
      customModel: "",
      jobDescription: "",
      hasApiKey: false,
      userInstructions: "",
      enhancementLevel: "moderate",
      focusAreas: [],
      enableFallback: true,
    },
  );

  const [, setShowAdvanced] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [costEstimate, setCostEstimate] = useState<Record<string, number>>({});
  const [isEstimatingCosts, setIsEstimatingCosts] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(formData);
    }
  }, [formData, onSettingsChange]);

  // Load models when provider changes
  useEffect(() => {
    const loadModels = async () => {
      if (!formData.provider) return;

      setIsLoadingModels(true);
      setModelsError(null);

      try {
        const models = await modelService.getModels(formData.provider);
        setAvailableModels(models);

        // Auto-select recommended model if no model is currently selected
        if (!formData.model && !useCustomModel) {
          const recommendedModel = models.find(
            (m) => m.isRecommended && !m.isDeprecated,
          );
          if (recommendedModel) {
            setFormData((prev) => ({ ...prev, model: recommendedModel.id }));
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load models";
        setModelsError(errorMessage);
        console.error("Failed to load models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, [formData.provider, useCustomModel]);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) return;

    setIsTestingConnection(true);
    setConnectionStatus("testing");

    try {
      const testSettings = { ...formData, hasApiKey: true };
      // Pass the API key directly for testing without storing it
      const success = await testAIConnection(testSettings, apiKey);
      setConnectionStatus(success ? "success" : "error");
    } catch (error) {
      console.error("Test connection error:", error);
      setConnectionStatus("error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleEstimateCosts = async () => {
    const sampleText = "Sample resume text for cost estimation";
    const sampleData = {
      personal: {
        fullName: "John Doe",
        email: "john@example.com",
        phone: "",
        location: "",
        linkedin: "",
        summary: "",
      },
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };

    setIsEstimatingCosts(true);
    try {
      const costs = await estimateEnhancementCosts(sampleText, sampleData);
      setCostEstimate(costs);
    } catch (error) {
      console.error("Failed to estimate costs:", error);
    } finally {
      setIsEstimatingCosts(false);
    }
  };

  const handleSave = async () => {
    console.log(
      `[EnhancedAISettings] Save button clicked. Provider: ${formData.provider}, API key length: ${apiKey.length}`,
    );

    if (!apiKey.trim()) {
      console.log(`[EnhancedAISettings] No API key entered`);
      alert("Please enter an API key");
      return;
    }

    try {
      console.log(
        `[EnhancedAISettings] About to store API key for provider: ${formData.provider}`,
      );
      // Store API key securely
      const { storeApiKey } = await import("@/services/secureStorage");
      await storeApiKey(formData.provider, apiKey);
      console.log(`[EnhancedAISettings] API key stored successfully`);

      // Save settings (without API key)
      const settingsToSave = {
        ...formData,
        hasApiKey: true,
      };
      setAISettings(settingsToSave);
      console.log(`[EnhancedAISettings] Settings saved to store`);

      alert("AI settings saved securely!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const currentProvider = PROVIDER_INFO[formData.provider];

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="text-green-500" size={16} />;
      case "medium":
        return <Clock className="text-amber-500" size={16} />;
      case "slow":
        return <Clock className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case "high":
        return <TrendingUp className="text-green-500" size={16} />;
      case "medium":
        return <TrendingUp className="text-amber-500" size={16} />;
      case "low":
        return <TrendingUp className="text-red-500" size={16} />;
      default:
        return <TrendingUp className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Provider Selection with Info Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-blue-600 dark:text-blue-400" size={20} />
            AI Provider Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.entries(PROVIDER_INFO).map(([key, info]) => (
              <div
                key={key}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  formData.provider === key
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-500"
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    provider: key as AISettings["provider"],
                  })
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {info.name}
                  </h3>
                  <div className="flex gap-1">
                    {getSpeedIcon(info.speed)}
                    {getQualityIcon(info.quality)}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {info.description}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                    <DollarSign size={12} />
                    <span>{info.pricing}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                    <Sparkles size={12} />
                    <span>{info.strengths.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Model Selection
              </label>
              <div className="flex items-center gap-2">
                {!useCustomModel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsLoadingModels(true);
                      modelService.clearCache(formData.provider);
                      // Don't worry - we'll guide you through the setup process.
                      setFormData((prev) => ({ ...prev }));
                    }}
                    disabled={isLoadingModels}
                    className="h-6 w-6 p-0"
                    title="Refresh models"
                  >
                    <RefreshCw
                      size={12}
                      className={isLoadingModels ? "animate-spin" : ""}
                    />
                  </Button>
                )}
                <input
                  type="checkbox"
                  id="useCustomModel"
                  checked={useCustomModel}
                  onChange={(e) => setUseCustomModel(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="useCustomModel"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Use custom model
                </label>
              </div>
            </div>

            {useCustomModel ? (
              <div>
                <TextInput
                  placeholder="Enter custom model name (e.g., gpt-4-0125-preview)"
                  value={formData.customModel || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, customModel: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use a specific model version or custom model name
                </p>
              </div>
            ) : (
              <div>
                <Select
                  value={formData.model || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  disabled={isLoadingModels}
                  className="w-full"
                >
                  <option value="">Select a model...</option>
                  {availableModels
                    .filter((model) => !model.isDeprecated)
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.isRecommended ? "⭐" : ""}
                        {model.description ? ` - ${model.description}` : ""}
                      </option>
                    ))}
                  {availableModels.some((model) => model.isDeprecated) && (
                    <optgroup label="Legacy Models">
                      {availableModels
                        .filter((model) => model.isDeprecated)
                        .map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} (Legacy)
                          </option>
                        ))}
                    </optgroup>
                  )}
                </Select>

                {isLoadingModels && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <RefreshCw size={12} className="animate-spin" />
                    Loading available models...
                  </p>
                )}

                {modelsError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Failed to load models: {modelsError}
                  </p>
                )}

                {formData.model && availableModels.length > 0 && (
                  <div className="mt-2 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                    {(() => {
                      const selectedModel = availableModels.find(
                        (m) => m.id === formData.model,
                      );
                      return selectedModel ? (
                        <div className="text-sm">
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            {selectedModel.name}{" "}
                            {selectedModel.isRecommended ? "⭐" : ""}
                          </p>
                          {selectedModel.description && (
                            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                              {selectedModel.description}
                            </p>
                          )}
                          {selectedModel.context_length && (
                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                              Context:{" "}
                              {selectedModel.context_length.toLocaleString()}{" "}
                              tokens
                            </p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cost Estimation */}
          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEstimateCosts}
              disabled={isEstimatingCosts}
              className="flex items-center gap-2"
            >
              {isEstimatingCosts ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <DollarSign size={14} />
              )}
              Estimate Costs
            </Button>
            {Object.keys(costEstimate).length > 0 && (
              <div className="flex gap-4 text-sm">
                {Object.entries(costEstimate).map(([provider, cost]) => (
                  <span
                    key={provider}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {provider}: ${cost.toFixed(4)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhancement Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings
              className="text-green-600 dark:text-green-400"
              size={20}
            />
            Enhancement Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Enhancement Level
              </label>
              <Select
                value={formData.enhancementLevel || "moderate"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enhancementLevel: e.target
                      .value as AISettings["enhancementLevel"],
                  })
                }
              >
                <option value="light">
                  Light - Grammar, clarity, basic improvements
                </option>
                <option value="moderate">
                  Moderate - Impact enhancement, keywords, metrics
                </option>
                <option value="comprehensive">
                  Comprehensive - Full optimization, ATS enhancement
                </option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Focus Areas
              </label>
              <Select
                value={formData.focusAreas?.[0] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    focusAreas: value ? [value] : [],
                  });
                }}
              >
                <option value="">General Enhancement</option>
                <option value="technical">
                  Technical Skills & Achievements
                </option>
                <option value="leadership">Leadership & Management</option>
                <option value="sales">Sales & Business Development</option>
                <option value="creative">Creative & Design</option>
                <option value="analytics">Data & Analytics</option>
                <option value="customer-service">Customer Service</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Job Description (Optional)
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Paste the target job description to tailor enhancements..."
              value={formData.jobDescription || ""}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              AI will optimize your resume to match job requirements and
              keywords
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Additional Instructions (Optional)
            </label>
            <TextInput
              placeholder="e.g., Emphasize quantitative achievements, focus on leadership..."
              value={formData.userInstructions || ""}
              onChange={(e) =>
                setFormData({ ...formData, userInstructions: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableFallback"
              checked={formData.enableFallback}
              onChange={(e) =>
                setFormData({ ...formData, enableFallback: e.target.checked })
              }
              className="rounded"
            />
            <label
              htmlFor="enableFallback"
              className="text-sm text-gray-900 dark:text-gray-100"
            >
              Enable automatic fallback to other providers if primary fails
            </label>
          </div>
        </CardContent>
      </Card>

      {/* API Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-purple-600" size={20} />
            API Key Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentProvider.name} API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <TextInput
                  type={showApiKey ? "text" : "password"}
                  placeholder={`Enter your ${currentProvider.name} API key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={!apiKey.trim() || isTestingConnection}
                className="flex items-center gap-1"
              >
                {isTestingConnection ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : connectionStatus === "success" ? (
                  <CheckCircle2 size={14} className="text-green-600" />
                ) : connectionStatus === "error" ? (
                  <AlertTriangle size={14} className="text-red-600" />
                ) : (
                  <Shield size={14} />
                )}
                Test
              </Button>
            </div>

            {connectionStatus === "success" && (
              <p className="mt-1 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 size={14} />
                Connection successful
              </p>
            )}

            {connectionStatus === "error" && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle size={14} />
                Connection failed - check your API key
              </p>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
            <div className="flex items-start gap-2">
              <ShieldCheck
                size={16}
                className="mt-0.5 text-blue-600 dark:text-blue-400"
              />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="mb-1 font-medium">Security Notice</p>
                <p>
                  API keys are stored securely in your browser&apos;s encrypted
                  storage. Your resume data is sent directly to{" "}
                  {currentProvider.name} for processing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Settings size={16} />
          Save AI Settings
        </Button>
      </div>
    </div>
  );
}
