import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { type AISettings as AISettingsType } from "@/types/resume";
import {
  secureStorage,
  getApiKey,
  storeApiKey,
  removeApiKey,
} from "@/services/secureStorage";
import { modelService, type Model } from "@/services/modelService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Select } from "@/components/ui/select";
import {
  Bot,
  Settings,
  Eye,
  EyeOff,
  Briefcase,
  Sparkles,
  Shield,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export function AISettings() {
  const { aiSettings, setAISettings } = useResumeStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState<AISettingsType>(
    aiSettings || {
      provider: "openai",
      model: "",
      customModel: "",
      jobDescription: "",
      hasApiKey: false,
      userInstructions: "",
    },
  );
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
  const [securityInfo] = useState(secureStorage.getSecurityInfo());
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Load API key when component mounts or provider changes
  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoadingApiKey(true);
      try {
        const storedKey = await getApiKey(formData.provider);
        setApiKey(storedKey || "");
        setFormData((prev) => ({ ...prev, hasApiKey: !!storedKey }));

        // If no stored key found, show helpful message
        if (!storedKey) {
          console.info(
            `No stored API key found for ${formData.provider}. Please enter your API key.`,
          );
        }
      } catch (error) {
        console.error("Failed to load API key:", error);
        // Clear any corrupted data and reset
        setApiKey("");
        setFormData((prev) => ({ ...prev, hasApiKey: false }));

        // Show user-friendly error message
        alert(
          "There was an issue loading your stored API key. Please re-enter your API key.",
        );
      } finally {
        setIsLoadingApiKey(false);
      }
    };

    loadApiKey();
  }, [formData.provider]);

  // Load models when provider or API key changes
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
  }, [formData.provider, formData.model, useCustomModel, apiKey]); // Reload when API key changes too

  const refreshModels = async () => {
    // Clear cache and reload models
    modelService.clearCache(formData.provider);
    setIsLoadingModels(true);
    setModelsError(null);

    try {
      const models = await modelService.getModels(formData.provider);
      setAvailableModels(models);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh models";
      setModelsError(errorMessage);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = async () => {
    console.log(
      `[AISettings] Save button clicked. Provider: ${formData.provider}, API key length: ${apiKey.length}`,
    );

    if (!apiKey.trim()) {
      console.log(`[AISettings] No API key entered`);
      alert("Please enter an API key");
      return;
    }

    try {
      console.log(
        `[AISettings] About to store API key for provider: ${formData.provider}`,
      );
      // Store API key securely
      await storeApiKey(formData.provider, apiKey);
      console.log(`[AISettings] API key stored successfully`);

      // Save settings (without API key)
      const settingsToSave = {
        ...formData,
        hasApiKey: true,
      };
      setAISettings(settingsToSave);
      console.log(`[AISettings] Settings saved to store`);

      alert("AI settings saved securely!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleClear = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your AI settings and API key?",
      )
    ) {
      try {
        // Remove API key from secure storage
        await removeApiKey(formData.provider);

        // Clear settings
        setAISettings(null);
        setFormData({
          provider: "openai",
          model: "",
          customModel: "",
          jobDescription: "",
          hasApiKey: false,
        });
        setApiKey("");
        setUseCustomModel(false);

        alert("AI settings and API key cleared successfully!");
      } catch (error) {
        console.error("Failed to clear settings:", error);
        alert("Failed to clear settings completely. Please try again.");
      }
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "openai":
        return {
          name: "OpenAI",
          apiKeyUrl: "https://platform.openai.com/api-keys",
        };
      case "anthropic":
        return {
          name: "Anthropic",
          apiKeyUrl: "https://console.anthropic.com/",
        };
      case "gemini":
        return {
          name: "Google Gemini",
          apiKeyUrl: "https://makersuite.google.com/app/apikey",
        };
      default:
        return null;
    }
  };

  const providerInfo = getProviderInfo(formData.provider);

  return (
    <Card className="border-gradient-to-br from-blue-500/10 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot size={20} className="text-blue-600" />
          AI Enhancement Settings
        </CardTitle>
        <CardDescription>
          Configure AI provider to enhance your resume achievements and tailor
          them to specific job postings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Provider</label>
          <Select
            value={formData.provider}
            onChange={(e) => {
              const value = e.target.value as "openai" | "anthropic" | "gemini";
              setFormData({
                ...formData,
                provider: value,
                model: "", // Will be auto-selected from available models
              });
            }}
            placeholder="Select AI provider"
          >
            <option value="openai">OpenAI (GPT)</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="gemini">Google Gemini</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Briefcase size={16} className="text-blue-600" />
            Job Description (Optional)
          </label>
          <textarea
            className="resize-vertical min-h-[120px] w-full rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste the job description here to help AI tailor your achievements to match the role requirements..."
            value={formData.jobDescription || ""}
            onChange={(e) =>
              setFormData({ ...formData, jobDescription: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            This will be used to enhance your resume bullet points with relevant
            keywords and focus areas
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Settings size={16} className="text-green-600" />
            Additional Instructions (Optional)
          </label>
          <textarea
            className="resize-vertical min-h-[80px] w-full rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add specific instructions for AI enhancement (e.g., 'Focus on leadership aspects', 'Emphasize technical skills', 'Use more quantitative language')..."
            value={formData.userInstructions || ""}
            onChange={(e) =>
              setFormData({ ...formData, userInstructions: e.target.value })
            }
            maxLength={500}
          />
          <p className="flex items-start gap-1 text-xs text-muted-foreground">
            <Shield size={12} className="mt-0.5 flex-shrink-0 text-green-600" />
            <span>
              Only resume-related instructions are allowed. Content is sanitized
              for security (max 500 characters)
            </span>
          </p>
        </div>

        {providerInfo && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles size={16} className="text-purple-600" />
                  Model Selection
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={refreshModels}
                    disabled={isLoadingModels}
                    className="px-2 text-xs"
                    title="Refresh available models"
                  >
                    <RefreshCw
                      size={12}
                      className={`mr-1 ${isLoadingModels ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={useCustomModel}
                      onChange={(e) => setUseCustomModel(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Custom model
                  </label>
                </div>
              </div>

              {modelsError && (
                <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                  <AlertTriangle size={12} />
                  <span>{modelsError}</span>
                </div>
              )}

              {!useCustomModel ? (
                <div className="space-y-2">
                  <Select
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder={
                      isLoadingModels ? "Loading models..." : "Select model"
                    }
                    disabled={isLoadingModels || availableModels.length === 0}
                  >
                    {availableModels.map((model) => (
                      <option
                        key={model.id}
                        value={model.id}
                        className={model.isDeprecated ? "text-red-600" : ""}
                      >
                        {model.name}
                        {model.isRecommended && " ⭐"}
                        {model.isDeprecated && " (Deprecated)"}
                      </option>
                    ))}
                  </Select>

                  {formData.model && availableModels.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const selectedModel = availableModels.find(
                          (m) => m.id === formData.model,
                        );
                        if (selectedModel) {
                          return (
                            <div className="flex items-start gap-2">
                              {selectedModel.isRecommended && (
                                <CheckCircle2
                                  size={12}
                                  className="mt-0.5 flex-shrink-0 text-green-600"
                                />
                              )}
                              {selectedModel.isDeprecated && (
                                <AlertTriangle
                                  size={12}
                                  className="mt-0.5 flex-shrink-0 text-red-600"
                                />
                              )}
                              <div>
                                <p>{selectedModel.description}</p>
                                {selectedModel.context_length && (
                                  <p className="mt-1 text-xs">
                                    Context:{" "}
                                    {selectedModel.context_length.toLocaleString()}{" "}
                                    tokens
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <TextInput
                    placeholder={`Enter custom ${providerInfo?.name} model name`}
                    value={formData.customModel || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, customModel: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the exact model name (e.g., gpt-4.1, claude-opus-4.1,
                    gemini-2.5-pro)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <TextInput
                    type={showApiKey ? "text" : "password"}
                    placeholder={`Enter your ${providerInfo.name} API key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isLoadingApiKey}
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
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href={providerInfo.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {providerInfo.name}
                </a>
              </p>
            </div>

            <div
              className={`flex items-start gap-2 rounded-lg p-3 ${
                securityInfo.isSecure
                  ? "border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50"
                  : "border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50"
              }`}
            >
              {securityInfo.isSecure ? (
                <ShieldCheck
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-green-600"
                />
              ) : (
                <Shield
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-amber-600"
                />
              )}
              <div
                className={`text-xs ${
                  securityInfo.isSecure
                    ? "text-green-800 dark:text-green-200"
                    : "text-amber-800 dark:text-amber-200"
                }`}
              >
                <p className="font-medium">
                  {securityInfo.isSecure
                    ? "🔒 Secure Storage"
                    : "⚠️ Security Notice"}
                </p>
                <p className="mb-2">
                  {securityInfo.isSecure
                    ? `API key encrypted with ${securityInfo.method}`
                    : `API key stored using ${securityInfo.method}`}
                </p>
                <p className="text-xs">
                  Resume content will be sent to {providerInfo.name} for AI
                  enhancement.
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">
                    Security Details
                  </summary>
                  <ul className="ml-2 mt-1 list-inside list-disc space-y-1">
                    {securityInfo.limitations.map((limitation, index) => (
                      <li key={index} className="text-xs">
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="mb-2 font-medium">🛡️ Security Best Practices</p>
                <ul className="ml-2 list-inside list-disc space-y-1">
                  <li>Use a dedicated API key with minimal permissions</li>
                  <li>Regularly rotate your API keys (monthly recommended)</li>
                  <li>Monitor API usage in your provider&apos;s dashboard</li>
                  <li>Never share your resume data on public networks</li>
                  <li>
                    Consider using environment variables for production
                    deployments
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1">
                <Settings size={16} className="mr-2" />
                Save Settings
              </Button>
              {aiSettings && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
