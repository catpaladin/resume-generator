<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { safeUUID } from '@/config/constants';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Textarea from '../../ui/textarea/textarea.svelte';
  import Button from '../../ui/button/button.svelte';
  import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
  import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';

  // Helper to create a new empty experience entry
  function addExperience() {
    resumeStore.addArrayItem('experience', {
      id: safeUUID(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      jobDescription: '',
      bulletPoints: []
    });
  }

  function removeExperience(index: number) {
    resumeStore.removeArrayItem('experience', index);
  }

  function moveExperience(index: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? index - 1 : index + 1;
    if (toIndex >= 0 && toIndex < resumeStore.resumeData.experience.length) {
      resumeStore.moveArrayItem('experience', index, toIndex);
    }
  }

  function moveBullet(expIndex: number, bulletIndex: number, direction: 'up' | 'down') {
    const bullets = [...resumeStore.resumeData.experience[expIndex].bulletPoints];
    const toIndex = direction === 'up' ? bulletIndex - 1 : bulletIndex + 1;
    
    if (toIndex >= 0 && toIndex < bullets.length) {
      const [moved] = bullets.splice(bulletIndex, 1);
      bullets.splice(toIndex, 0, moved);
      resumeStore.resumeData.experience[expIndex].bulletPoints = bullets;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center px-1">
    <Label class="text-lg font-semibold text-slate-800 dark:text-slate-200">Work Experience</Label>
    <Button onclick={addExperience} size="sm" class="shadow-sm">
      <Plus class="mr-2 h-4 w-4" /> Add Experience
    </Button>
  </div>

  {#if resumeStore.resumeData.experience.length === 0}
    <div class="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
      No experience added yet. Click "Add Experience" to start.
    </div>
  {:else}
    <Accordion type="single" class="w-full space-y-3" value="item-0">
      {#each resumeStore.resumeData.experience as exp, index (exp.id)}
        <div class="flex items-start gap-3 group">
            <div class="flex flex-col gap-1 pt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <button 
                    type="button"
                    class="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                    onclick={() => moveExperience(index, 'up')}
                    disabled={index === 0}
                >
                    <ChevronUp class="h-4 w-4" />
                </button>
                <button 
                    type="button"
                    class="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                    onclick={() => moveExperience(index, 'down')}
                    disabled={index === resumeStore.resumeData.experience.length - 1}
                >
                    <ChevronDown class="h-4 w-4" />
                </button>
            </div>
            <AccordionItem value={`item-${index}`} class="flex-1 border-2 rounded-xl px-8 bg-card shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 overflow-visible">
                <AccordionTrigger class="hover:no-underline py-5">
                    <div class="flex flex-col items-start gap-1">
                        <span class="text-left font-bold text-slate-900 dark:text-slate-100">
                            {exp.position || '(No Position)'}
                        </span>
                        <span class="text-xs text-slate-500 font-medium">
                            {exp.company || 'Company Name'}
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div class="grid gap-8 pt-6 border-t pb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <Label>Company</Label>
                            <Input bind:value={resumeStore.resumeData.experience[index].company} placeholder="Company Name" />
                        </div>
                        <div class="space-y-2">
                            <Label>Position</Label>
                            <Input bind:value={resumeStore.resumeData.experience[index].position} placeholder="Job Title" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <Label>Start Date</Label>
                            <Input bind:value={resumeStore.resumeData.experience[index].startDate} placeholder="MM/YYYY" />
                        </div>
                        <div class="space-y-2">
                            <Label>End Date</Label>
                            <Input bind:value={resumeStore.resumeData.experience[index].endDate} placeholder="MM/YYYY or Present" />
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <Label>Location</Label>
                        <Input bind:value={resumeStore.resumeData.experience[index].location} placeholder="City, State or Remote" />
                    </div>

                    <div class="space-y-2">
                        <Label>Job Description</Label>
                        <Textarea 
                            bind:value={resumeStore.resumeData.experience[index].jobDescription} 
                            placeholder="Summarize your role and impact..." 
                            autoresize={true}
                            rows={2}
                        />
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                        <Label class="font-bold text-slate-700 dark:text-slate-300">Detailed Bullet Points</Label>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            class="h-7 text-[11px] font-bold px-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            onclick={() => {
                            const newBullet = { id: safeUUID(), text: '' };
                            resumeStore.resumeData.experience[index].bulletPoints = [
                                ...resumeStore.resumeData.experience[index].bulletPoints,
                                newBullet
                            ];
                            }}
                        >
                            <Plus class="mr-1 h-3 w-3" /> ADD POINT
                        </Button>
                        </div>
                        
                        <div class="space-y-3">
                        {#each exp.bulletPoints as bullet, bulletIndex (bullet.id)}
                            <div class="flex items-start gap-2 group/bullet">
                                <div class="flex flex-col gap-0.5 pt-2 opacity-0 group-hover/bullet:opacity-100 transition-opacity">
                                    <button 
                                        type="button"
                                        class="text-slate-300 hover:text-blue-500 disabled:opacity-10" 
                                        onclick={() => moveBullet(index, bulletIndex, 'up')}
                                        disabled={bulletIndex === 0}
                                    >
                                        <ChevronUp class="h-3 w-3" />
                                    </button>
                                    <button 
                                        type="button"
                                        class="text-slate-300 hover:text-blue-500 disabled:opacity-10" 
                                        onclick={() => moveBullet(index, bulletIndex, 'down')}
                                        disabled={bulletIndex === exp.bulletPoints.length - 1}
                                    >
                                        <ChevronDown class="h-3 w-3" />
                                    </button>
                                </div>
                                <Textarea 
                                    bind:value={resumeStore.resumeData.experience[index].bulletPoints[bulletIndex].text} 
                                    placeholder="Key achievement or responsibility..." 
                                    autoresize={true}
                                    rows={1}
                                    class="flex-1"
                                />
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    class="h-9 w-9 flex-shrink-0 text-slate-300 hover:text-destructive hover:bg-destructive/5"
                                    onclick={() => {
                                    resumeStore.resumeData.experience[index].bulletPoints = 
                                        resumeStore.resumeData.experience[index].bulletPoints.filter((_, i) => i !== bulletIndex);
                                    }}
                                >
                                    <Trash2 class="h-4 w-4" />
                                </Button>
                            </div>
                        {/each}
                        
                        {#if exp.bulletPoints.length === 0}
                            <p class="text-xs text-muted-foreground text-center py-4 italic bg-slate-50/50 dark:bg-slate-900/20 rounded-lg">
                            No bullet points added yet.
                            </p>
                        {/if}
                        </div>
                    </div>

                    <div class="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="destructive" size="sm" class="h-8 text-xs font-semibold" onclick={() => removeExperience(index)}>
                        <Trash2 class="mr-2 h-3.5 w-3.5" /> Remove Work Experience
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
