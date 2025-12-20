<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { safeUUID } from '@/config/constants';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Button from '../../ui/button/button.svelte';
  import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
  import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';

  let mounted = $state(false);
  $effect(() => {
    mounted = true;
  });

  function addEducation() {
    resumeStore.addArrayItem('education', {
      id: safeUUID(),
      school: '',
      degree: '',
      graduationYear: ''
    });
  }

  function removeEducation(index: number) {
    resumeStore.removeArrayItem('education', index);
  }

  function moveEducation(index: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? index - 1 : index + 1;
    if (toIndex >= 0 && toIndex < resumeStore.resumeData.education.length) {
      resumeStore.moveArrayItem('education', index, toIndex);
    }
  }
</script>

<div class="space-y-4 p-1 overflow-visible">
  <div class="flex justify-between items-center px-1">
    <Label class="text-lg font-semibold text-slate-800 dark:text-slate-200">Education</Label>
    <Button onclick={addEducation} size="sm" class="shadow-sm">
      <Plus class="mr-2 h-4 w-4" /> Add Education
    </Button>
  </div>

  {#if resumeStore.resumeData.education.length === 0}
    <div class="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
      No education added yet. Click "Add Education" to start.
    </div>
  {:else}
    {#if mounted}
        <Accordion type="single" class="w-full space-y-3" value="item-0">
        {#each resumeStore.resumeData.education as edu, index (edu.id)}
            <div class="flex items-start gap-3 group">
                <div class="flex flex-col gap-1 pt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                        type="button"
                        class="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        onclick={() => moveEducation(index, 'up')}
                        disabled={index === 0}
                    >
                        <ChevronUp class="h-4 w-4" />
                    </button>
                    <button 
                        type="button"
                        class="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        onclick={() => moveEducation(index, 'down')}
                        disabled={index === resumeStore.resumeData.education.length - 1}
                    >
                        <ChevronDown class="h-4 w-4" />
                    </button>
                </div>
                <AccordionItem value={`item-${index}`} class="flex-1 border-2 rounded-xl px-8 bg-card shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 overflow-visible">
                    <AccordionTrigger class="hover:no-underline py-5">
                        <div class="flex flex-col items-start gap-1">
                            <span class="text-left font-bold text-slate-900 dark:text-slate-100">
                                {edu.degree || '(No Degree)'}
                            </span>
                            <span class="text-xs text-slate-500 font-medium">
                                {edu.school || 'Institution Name'}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div class="grid gap-8 pt-6 border-t pb-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <Label>School</Label>
                                <Input bind:value={resumeStore.resumeData.education[index].school} placeholder="University Name" />
                            </div>
                            <div class="space-y-2">
                                <Label>Degree</Label>
                                <Input bind:value={resumeStore.resumeData.education[index].degree} placeholder="Bachelor's, Master's, etc." />
                            </div>
                        </div>
                        
                        <div class="space-y-2">
                            <Label>Graduation Year</Label>
                            <Input bind:value={resumeStore.resumeData.education[index].graduationYear} placeholder="2024" />
                        </div>

                        <div class="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="destructive" size="sm" class="h-8 text-xs font-semibold" onclick={() => removeEducation(index)}>
                            <Trash2 class="mr-2 h-3.5 w-3.5" /> Remove Education
                            </Button>
                        </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </div>
        {/each}
        </Accordion>
    {:else}
        <div class="space-y-3">
            {#each resumeStore.resumeData.education as edu (edu.id)}
                <div class="border-2 rounded-xl px-8 py-5 bg-card opacity-50">
                    <div class="flex flex-col items-start gap-1">
                        <span class="font-bold text-slate-900 dark:text-slate-100">{edu.degree || '(No Degree)'}</span>
                        <span class="text-xs text-slate-500">{edu.school || 'Institution Name'}</span>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
  {/if}
</div>
