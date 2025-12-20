<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import Button from '../ui/button/button.svelte';
  import Input from '../ui/input/input.svelte';
  import Label from '../ui/label/label.svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
  import { X, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { modelsDevService } from '@/services/modelsDevService.svelte.ts';

  let { show = $bindable(false) } = $props();

  let isTesting = $state(false);
  let isRefreshing = $state(false);
  let testResult = $state<{ success: boolean; message: string } | null>(null);
  let lastRefresh = $state(modelsDevService.getLastFetchDate());

  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'mistral', name: 'Mistral AI' },
    { id: 'groq', name: 'Groq' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'xai', name: 'xAI (Grok)' }
  ];

  let availableModels = $derived(
    modelsDevService.getModelsForProvider(resumeStore.aiSettings.provider)
  );

  async function refreshModels() {
    isRefreshing = true;
    try {
      await modelsDevService.refresh();
      lastRefresh = modelsDevService.getLastFetchDate();
    } finally {
      isRefreshing = false;
    }
  }

  $effect(() => {
    if (show && !modelsDevService.isDataLoaded()) {
      modelsDevService.fetchModels().then(() => {
        lastRefresh = modelsDevService.getLastFetchDate();
      });
    }
  });

  // Reset model if it's not in the available models for the new provider
  $effect(() => {
    const provider = resumeStore.aiSettings.provider;
    const currentModel = resumeStore.aiSettings.model;
    
    if (modelsDevService.isDataLoaded()) {
      const models = modelsDevService.getModelsForProvider(provider);
      if (models.length > 0 && !models.some(m => m.id === currentModel)) {
        resumeStore.updateAISettings({ model: models[0].id });
      }
    }
  });

  // Pre-fetch all models for all providers on mount
  $effect(() => {
    if (!modelsDevService.isDataLoaded()) {
      modelsDevService.fetchModels();
    }
  });

  async function testConnection() {
    isTesting = true;
    testResult = null;
    
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: resumeStore.aiSettings.provider,
          apiKey: resumeStore.aiSettings.apiKey
        })
      });
      
      const data = await response.json();
      testResult = {
        success: data.success,
        message: data.success ? 'Connection successful!' : data.error || 'Connection failed'
      };
    } catch (err) {
      testResult = { success: false, message: 'Failed to reach API server' };
    } finally {
      isTesting = false;
    }
  }

  function handleClose() {
    show = false;
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    transition:fade={{ duration: 200 }}
    onclick={handleClose}
    role="presentation"
  >
    <div 
      class="w-full max-w-lg"
      transition:scale={{ duration: 200, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <Card class="shadow-xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>AI Settings</CardTitle>
            <CardDescription>Configure your AI provider and API keys.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onclick={handleClose}>
            <X class="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-2">
            <Label>AI Provider</Label>
            <div class="flex gap-2">
              <select 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                bind:value={resumeStore.aiSettings.provider}
              >
                {#each providers as provider}
                  <option value={provider.id}>{provider.name}</option>
                {/each}
              </select>
              <div class="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted/30 overflow-hidden">
                <img 
                  src={modelsDevService.getLogoUrl(resumeStore.aiSettings.provider)} 
                  alt={resumeStore.aiSettings.provider}
                  class="w-6 h-6 object-contain"
                  onerror={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== 'https://models.dev/logos/default.svg') {
                      img.src = 'https://models.dev/logos/default.svg';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label>API Key</Label>
            <Input 
              type="password" 
              bind:value={resumeStore.aiSettings.apiKey} 
              placeholder="Enter your API key" 
            />
            <p class="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Model</Label>
              <button 
                class="text-xs text-primary hover:underline flex items-center gap-1"
                onclick={refreshModels}
                disabled={isRefreshing}
              >
                <RefreshCw class="h-3 w-3 {isRefreshing ? 'animate-spin' : ''}" />
                Refresh
              </button>
            </div>
            <select 
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              bind:value={resumeStore.aiSettings.model}
            >
              {#if availableModels.length > 0}
                {#each availableModels as model}
                  <option value={model.id}>{model.name}</option>
                {/each}
              {:else}
                <option value="">No models available</option>
              {/if}
            </select>
            {#if lastRefresh}
              <p class="text-[10px] text-muted-foreground text-right">
                Last updated: {lastRefresh.toLocaleString()}
              </p>
            {/if}
          </div>

          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between">
              <Button 
                variant="outline" 
                onclick={testConnection} 
                disabled={isTesting || !resumeStore.aiSettings.apiKey}
              >
                {#if isTesting}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                {:else}
                  Test Connection
                {/if}
              </Button>
              <Button onclick={handleClose}>Save & Close</Button>
            </div>

            {#if testResult}
              <div 
                class="flex items-center gap-2 rounded-lg p-3 text-sm {testResult.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive'}"
                transition:fade
              >
                {#if testResult.success}
                  <CheckCircle2 class="h-4 w-4" />
                {:else}
                  <AlertCircle class="h-4 w-4" />
                {/if}
                {testResult.message}
              </div>
            {/if}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
{/if}
