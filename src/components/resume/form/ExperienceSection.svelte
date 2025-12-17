<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Textarea from '../../ui/textarea/textarea.svelte';
  import Button from '../../ui/button/button.svelte';
  import * as Accordion from '../../ui/accordion/accordion.svelte';
  import AccordionItem from '../../ui/accordion/accordion-item.svelte';
  import AccordionTrigger from '../../ui/accordion/accordion-trigger.svelte';
  import AccordionContent from '../../ui/accordion/accordion-content.svelte';
  import { Plus, Trash2 } from 'lucide-svelte';

  // Helper to create a new empty experience entry
  function addExperience() {
    resumeStore.addArrayItem('experience', {
      id: crypto.randomUUID(),
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
</script>

<div class="space-y-4">
  <div class="flex justify-end">
    <Button onclick={addExperience} size="sm">
      <Plus class="mr-2 h-4 w-4" /> Add Experience
    </Button>
  </div>

  {#if resumeStore.resumeData.experience.length === 0}
    <div class="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
      No experience added yet. Click "Add Experience" to start.
    </div>
  {:else}
    <Accordion.default type="single" class="w-full" value={`item-0`}>
      {#each resumeStore.resumeData.experience as exp, index}
        <AccordionItem value={`item-${index}`}>
          <AccordionTrigger class="hover:no-underline">
            <span class="text-left font-medium">
              {exp.position || '(No Position)'} at {exp.company || '(No Company)'}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div class="grid gap-4 pt-4 border-t">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label>Company</Label>
                    <Input bind:value={resumeStore.resumeData.experience[index].company} placeholder="Company Name" />
                  </div>
                  <div class="space-y-2">
                    <Label>Position</Label>
                    <Input bind:value={resumeStore.resumeData.experience[index].position} placeholder="Job Title" />
                  </div>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <Textarea bind:value={resumeStore.resumeData.experience[index].jobDescription} placeholder="General description..." />
               </div>
               
               <!-- TODO: Bullet points editor would go here -->

               <div class="flex justify-end pt-2">
                 <Button variant="destructive" size="sm" onclick={() => removeExperience(index)}>
                   <Trash2 class="mr-2 h-4 w-4" /> Remove
                 </Button>
               </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      {/each}
    </Accordion.default>
  {/if}
</div>
