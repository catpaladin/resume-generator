<script lang="ts">
  import ResumeBuilder from './ResumeBuilder.svelte';
  import ResumePreview from './preview/ResumePreview.svelte';
  import { resumeStore } from '@/store/resume.svelte';
  import { Sparkles, FileText, Eye, CheckCircle2 } from 'lucide-svelte';

  let activeSection = $derived(resumeStore.uiState.activeSection);
  let viewMode = $derived(resumeStore.uiState.viewMode);
  
  const sections = [
    { id: 'personal', label: 'Personal' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' }
  ];

  function toggleMode(mode: 'editor' | 'preview') {
    resumeStore.setUIState({ viewMode: mode });
  }
</script>

<div class="space-y-8 pb-20">
    <!-- Premium Resume Studio Dashboard -->
    <div id="resume-studio-header" class="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:hidden transition-all duration-500">
        <div class="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex items-center gap-5">
                <div class="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                    <Sparkles class="text-white" size={24} />
                </div>
                <div>
                    <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-2">
                        Resume Studio
                        <span class="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-black tracking-widest">PRO</span>
                    </h2>
                    <div class="flex items-center gap-2 mt-1">
                        <div class="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cloud Sync Active</span>
                    </div>
                </div>
            </div>

            <!-- View Toggle Switch -->
            <div class="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <button 
                    class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300
                    {viewMode === 'editor' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-200'}"
                    onclick={() => toggleMode('editor')}
                >
                    <FileText size={14} />
                    Build
                </button>
                <button 
                    class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300
                    {viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-200'}"
                    onclick={() => toggleMode('preview')}
                >
                    <Eye size={14} />
                    Finish
                </button>
            </div>
        </div>
        
        {#if viewMode === 'editor'}
            <div class="px-6 py-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800/50 bg-slate-900/50">
                {#each sections as section (section.id)}
                    <button 
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 whitespace-nowrap group
                        {activeSection === section.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
                        onclick={() => resumeStore.setUIState({ activeSection: section.id })}
                    >
                        {section.label.toUpperCase()}
                        {#if activeSection === section.id}
                            <CheckCircle2 size={12} />
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    {#if viewMode === 'editor'}
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div class="space-y-6">
                <ResumeBuilder />
            </div>
            
            <div class="hidden lg:block lg:sticky lg:top-24 h-fit">
                <ResumePreview />
            </div>
        </div>
    {:else}
        <div class="max-w-4xl mx-auto pb-20">
            <ResumePreview />
        </div>
    {/if}
</div>
