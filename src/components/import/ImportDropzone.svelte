<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { AIEnhancedImportManager, type AIImportProgress } from '@/lib/importers/ai-enhanced-import-manager';
  import Button from '../ui/button/button.svelte';
  import { Card } from '../ui/card';
  import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  let isDragging = $state(false);
  let isImporting = $state(false);
  let progress = $state<AIImportProgress | null>(null);
  let error = $state<string | null>(null);
  let success = $state(false);

  const importManager = new AIEnhancedImportManager({
    enableAI: true,
    aiSettings: resumeStore.aiSettings,
    onAIProgress: (p) => {
      progress = p;
    }
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.docx')) {
      error = "Unsupported file type. Please upload PDF, DOCX, or JSON.";
      return;
    }

    isImporting = true;
    error = null;
    success = false;

    try {
      // Update AI settings in manager just in case they changed
      importManager.updateAIOptions({
        aiSettings: {
          ...resumeStore.aiSettings,
          hasApiKey: !!resumeStore.aiSettings.apiKey
        }
      });

      const result = await importManager.importFile(file);
      
      if (result.success && result.data) {
        resumeStore.setResumeData(result.data);
        success = true;
        setTimeout(() => {
          success = false;
          isImporting = false;
        }, 2000);
      } else {
        error = result.errors?.[0]?.message || "Failed to import resume.";
        isImporting = false;
      }
    } catch (err: any) {
      console.error("Import error:", err);
      error = err.message || "An unexpected error occurred during import.";
      isImporting = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    handleFiles(e.dataTransfer?.files || null);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function onDragLeave() {
    isDragging = false;
  }

  function onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    handleFiles(input.files);
  }
</script>

<div class="space-y-4">
  <div
    class="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}"
    role="presentation"
    onpointerover={() => {}}
    onpointerleave={() => {}}
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
  >
    <input
      type="file"
      class="absolute inset-0 cursor-pointer opacity-0"
      accept=".pdf,.docx,.json"
      onchange={onFileSelect}
      disabled={isImporting}
    />
    
    {#if isImporting}
      <div class="space-y-4" transition:fade>
        <Loader2 class="mx-auto h-12 w-12 animate-spin text-primary" />
        <div class="space-y-2">
          <p class="font-medium">{progress?.message || 'Processing file...'}</p>
          {#if progress}
            <div class="h-2 w-48 overflow-hidden rounded-full bg-secondary">
              <div 
                class="h-full bg-primary transition-all duration-300" 
                style="width: {progress.progress}%"
              ></div>
            </div>
          {/if}
        </div>
      </div>
    {:else if success}
      <div class="space-y-2 text-green-600 dark:text-green-400" transition:fade>
        <CheckCircle2 class="mx-auto h-12 w-12" />
        <p class="font-medium">Import Successful!</p>
      </div>
    {:else}
      <Upload class="mb-4 h-12 w-12 text-muted-foreground" />
      <div class="space-y-1">
        <p class="text-lg font-medium">Click or drag resume here</p>
        <p class="text-sm text-muted-foreground">Supports PDF, DOCX, and JSON</p>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" transition:fade>
      <AlertCircle class="h-4 w-4" />
      {error}
    </div>
  {/if}

  <div class="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
    <div class="flex items-start gap-2">
      <FileText class="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>AI-Enhanced Import:</strong> Our AI will automatically parse your resume and structure it into the builder. For best results, ensure your AI settings are configured with an API key.
      </p>
    </div>
  </div>
</div>
