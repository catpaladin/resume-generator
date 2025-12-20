<script lang="ts">
    import ThemeToggle from '../ui/ThemeToggle.svelte';
    import { FileText, Settings, Download, Upload, Trash2, ChevronDown } from 'lucide-svelte';
    import { resumeStore } from '@/store/resume.svelte';
    import { exportResumeData, exportResumeToDocx } from '@/lib/utils';
    import AISettingsModal from '../ai/AISettingsModal.svelte';
    import ImportModal from '../import/ImportModal.svelte';

    let showAISettings = $state(false);
    let showImportModal = $state(false);
    let showExportMenu = $state(false);

    function handleExportJSON() {
        exportResumeData(resumeStore.resumeData);
        showExportMenu = false;
    }

    async function handleExportDocx() {
        await exportResumeToDocx(resumeStore.resumeData);
        showExportMenu = false;
    }

    // PDF export using browser print functionality
    async function handleExportPdf() {
        // Get current theme
        const isDark = document.documentElement.classList.contains('dark');
        
        // Temporarily switch to light mode for printing
        if (isDark) {
            document.documentElement.classList.remove('dark');
        }
        
        // Wait for theme to apply and layout to stabilize
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Trigger print dialog (which allows saving as PDF)
        window.print();
        
        // Restore dark mode after print with a slight delay
        if (isDark) {
            setTimeout(() => {
                document.documentElement.classList.add('dark');
            }, 300);
        }
        
        showExportMenu = false;
    }

    function handleClearAll() {
        resumeStore.resetResumeData();
    }

    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.export-menu')) {
            showExportMenu = false;
        }
    }
</script>

<svelte:document onclick={handleClickOutside} />

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

        <!-- Import Button -->
        <button 
            class="bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-1.5 rounded font-semibold text-xs flex items-center gap-2" 
            onclick={() => showImportModal = true}
        >
            <Upload size={14} />
            IMPORT
        </button>

        <!-- Export Menu -->
        <div class="export-menu relative">
            <button 
                class="bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-1.5 rounded font-semibold text-xs flex items-center gap-2" 
                onclick={() => showExportMenu = !showExportMenu}
            >
                <Download size={14} />
                EXPORT
                <ChevronDown size={14} class="transition-transform {showExportMenu ? 'rotate-180' : ''}" />
            </button>

            {#if showExportMenu}
                <div class="absolute top-full right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg py-2 min-w-[180px] z-[200]">
                    <button 
                        class="w-full px-4 py-2 text-left text-xs hover:bg-slate-700 flex items-center gap-3 transition-colors" 
                        onclick={handleExportJSON}
                    >
                        <div class="w-4 h-4 flex items-center justify-center">
                            <span class="text-[10px] font-bold text-slate-400">JSON</span>
                        </div>
                        <span>Export as JSON</span>
                    </button>
                    
                    <button 
                        class="w-full px-4 py-2 text-left text-xs hover:bg-slate-700 flex items-center gap-3 transition-colors" 
                        onclick={handleExportDocx}
                    >
                        <div class="w-4 h-4 flex items-center justify-center">
                            <span class="text-[10px] font-bold text-blue-400">DOCX</span>
                        </div>
                        <span>Export as DOCX</span>
                    </button>
                    
                    <button 
                        class="w-full px-4 py-2 text-left text-xs hover:bg-slate-700 flex items-center gap-3 transition-colors" 
                        onclick={handleExportPdf}
                    >
                        <div class="w-4 h-4 flex items-center justify-center">
                            <span class="text-[10px] font-bold text-red-400">PDF</span>
                        </div>
                        <span>Export as PDF</span>
                    </button>
                </div>
            {/if}
        </div>

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
    <ImportModal bind:show={showImportModal} onImportComplete={() => showImportModal = false} />
{/if}