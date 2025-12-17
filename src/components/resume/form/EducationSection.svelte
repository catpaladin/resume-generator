<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Button from '../../ui/button/button.svelte';
  import * as Accordion from '../../ui/accordion/accordion.svelte';
  import AccordionItem from '../../ui/accordion/accordion-item.svelte';
  import AccordionTrigger from '../../ui/accordion/accordion-trigger.svelte';
  import AccordionContent from '../../ui/accordion/accordion-content.svelte';
  import { Plus, Trash2 } from 'lucide-svelte';

  function addEducation() {
    resumeStore.addArrayItem('education', {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      graduationYear: ''
    });
  }


  function removeEducation(index: number) {
    resumeStore.removeArrayItem('education', index);
  }
</script>

<div class="space-y-4">
  <div class="flex justify-end">
    <Button onclick={addEducation} size="sm">
      <Plus class="mr-2 h-4 w-4" /> Add Education
    </Button>
  </div>

  {#if resumeStore.resumeData.education.length === 0}
    <div class="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
      No education added yet.
    </div>
  {:else}
    <Accordion.default type="single" class="w-full" value="item-0">
      {#each resumeStore.resumeData.education as edu, index}
        <AccordionItem value={`item-${index}`}>
          <AccordionTrigger class="hover:no-underline">
             <span class="text-left font-medium">
              {edu.degree || '(No Degree)'} - {edu.school || '(No School)'}
            </span>
          </AccordionTrigger>
          <AccordionContent>
             <div class="grid gap-4 pt-4 border-t">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div class="flex justify-end pt-2">
                 <Button variant="destructive" size="sm" onclick={() => removeEducation(index)}>
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
