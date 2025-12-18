<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import Button from '../ui/button/button.svelte';
  import Input from '../ui/input/input.svelte';
  import Label from '../ui/label/label.svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
  import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';

  let { show = $bindable(false) } = $props();

  let isTesting = $state(false);
  let testResult = $state<{ success: boolean; message: string } | null>(null);

  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'gemini', name: 'Google Gemini' }
  ];

  const modelsByProvider: Record<string, string[]> = {
    openai: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
    anthropic: ['claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-flash']
  };

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
            <select 
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              bind:value={resumeStore.aiSettings.provider}
            >
              {#each providers as provider}
                <option value={provider.id}>{provider.name}</option>
              {/each}
            </select>
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
            <Label>Model</Label>
            <select 
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              bind:value={resumeStore.aiSettings.model}
            >
              {#each modelsByProvider[resumeStore.aiSettings.provider] || [] as model}
                <option value={model}>{model}</option>
              {/each}
            </select>
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
