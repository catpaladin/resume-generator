<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { safeUUID } from '@/config/constants';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Textarea from '../../ui/textarea/textarea.svelte';
  import Button from '../../ui/button/button.svelte';
  import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
  import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';

  function addProject() {
    resumeStore.addArrayItem('projects', {
      id: safeUUID(),
      name: '',
      description: '',
      url: '',
      technologies: []
    });
  }

  function removeProject(index: number) {
    resumeStore.removeArrayItem('projects', index);
  }

  function moveProject(index: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? index - 1 : index + 1;
    if (toIndex >= 0 && toIndex < resumeStore.resumeData.projects.length) {
      resumeStore.moveArrayItem('projects', index, toIndex);
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center px-1">
    <Label class="text-lg font-semibold text-slate-800 dark:text-slate-200">Projects</Label>
    <Button onclick={addProject} size="sm" class="shadow-sm">
      <Plus class="mr-2 h-4 w-4" /> Add Project
    </Button>
  </div>

  {#if resumeStore.resumeData.projects.length === 0}
    <div class="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
      No projects added yet. Click "Add Project" to start.
    </div>
  {:else}
    <Accordion type="single" class="w-full space-y-3" value="item-0">
      {#each resumeStore.resumeData.projects as project, index (project.id)}
        <div class="flex items-start gap-3 group">
            <div class="flex flex-col gap-1 pt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <button 
                    type="button"
                    class="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                    onclick={() => moveProject(index, 'up')}
                    disabled={index === 0}
                >
                    <ChevronUp class="h-4 w-4" />
                </button>
                <button 
                    type="button"
                    class="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                    onclick={() => moveProject(index, 'down')}
                    disabled={index === resumeStore.resumeData.projects.length - 1}
                >
                    <ChevronDown class="h-4 w-4" />
                </button>
            </div>
            <AccordionItem value={`item-${index}`} class="flex-1 border-2 rounded-xl px-8 bg-card shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 overflow-visible">
                <AccordionTrigger class="hover:no-underline py-5">
                    <span class="text-left font-bold text-slate-900 dark:text-slate-100">
                    {project.name || '(No Project Name)'}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div class="grid gap-6 pt-6 border-t pb-6">
                    <div class="space-y-2">
                        <Label>Project Name</Label>
                        <Input bind:value={resumeStore.resumeData.projects[index].name} placeholder="Project Name" />
                    </div>
                    
                    <div class="space-y-2">
                        <Label>Project Link</Label>
                        <Input bind:value={resumeStore.resumeData.projects[index].url} placeholder="https://..." />
                    </div>

                    <div class="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            bind:value={resumeStore.resumeData.projects[index].description} 
                            placeholder="What did you build?" 
                            autoresize={true}
                            rows={3}
                        />
                    </div>

                    <div class="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="destructive" size="sm" class="h-8 text-xs font-semibold" onclick={() => removeProject(index)}>
                        <Trash2 class="mr-2 h-3.5 w-3.5" /> Remove Project
                        </Button>
                    </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </div>
      {/each}
    </Accordion>
  {/if}
</div>
