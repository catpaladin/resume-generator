<script lang="ts">
    import ThemeToggle from '../ui/ThemeToggle.svelte';
    import { FileText, Settings, Download, Share, Trash2 } from 'lucide-svelte';
    import { resumeStore } from '@/store/resume.svelte';
    import { exportResumeData } from '@/lib/utils';
    import AISettingsModal from '../ai/AISettingsModal.svelte';
    import ImportModal from '../import/ImportModal.svelte';

    let showAISettings = $state(false);
    let showImportModal = $state(false);

    function handleExportJSON() {
        exportResumeData(resumeStore.resumeData);
    }

    function handleClearAll() {
        resumeStore.resetResumeData();
    }
</script>

<div class="w-full bg-slate-900 text-white px-6 flex justify-between items-center z-[100] sticky top-0 h-16 shadow-lg border-b border-white/10 print:hidden">
    <div class="flex items-center gap-3">
        <div class="bg-blue-600 p-1.5 rounded-lg">
            <FileText size={20} class="text-white" />
        </div>
        <span class="font-bold uppercase tracking-widest text-sm hidden sm:block">Resume Builder</span>
    </div>
    
    <div class="flex items-center gap-3">
        <button 
            class="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5 flex items-center gap-2" 
            onclick={handleClearAll}
            title="Clear All Data"
        >
            <Trash2 size={18} />
            <span class="text-[10px] font-bold uppercase hidden md:block">Clear</span>
        </button>

        <div class="w-px h-6 bg-white/10 mx-1"></div>

        <button 
            class="bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-1.5 rounded font-semibold text-xs flex items-center gap-2" 
            onclick={() => showImportModal = true}
        >
            <Download size={14} class="rotate-180" />
            IMPORT
        </button>
        
        <button 
            class="bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-1.5 rounded font-semibold text-xs flex items-center gap-2" 
            onclick={handleExportJSON}
        >
            <Share size={14} />
            SAVE JSON
        </button>

        <div class="w-px h-6 bg-white/10 mx-1"></div>

        <button 
            class="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5" 
            onclick={() => showAISettings = true}
            title="AI Configuration"
        >
            <Settings size={20} />
        </button>
        
        <ThemeToggle />
    </div>
</div>

{#if showAISettings}
    <AISettingsModal bind:show={showAISettings} />
{/if}

{#if showImportModal}
    <ImportModal bind:show={showImportModal} />
{/if}
