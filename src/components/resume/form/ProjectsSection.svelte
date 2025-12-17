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

  function addProject() {
    resumeStore.addArrayItem('projects', {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      url: '',
      technologies: []
    });
  }

  function removeProject(index: number) {
    resumeStore.removeArrayItem('projects', index);
  }
</script>

<div class="space-y-4">
  <div class="flex justify-end">
    <Button onclick={addProject} size="sm">
      <Plus class="mr-2 h-4 w-4" /> Add Project
    </Button>
  </div>

  {#if resumeStore.resumeData.projects.length === 0}
    <div class="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
      No projects added yet.
    </div>
  {:else}
    <Accordion.default type="single" class="w-full" value="item-0">
      {#each resumeStore.resumeData.projects as project, index}
        <AccordionItem value={`item-${index}`}>
          <AccordionTrigger class="hover:no-underline">
            <span class="text-left font-medium">
              {project.name || '(No Project Name)'}
            </span>
          </AccordionTrigger>
          <AccordionContent>
             <div class="grid gap-4 pt-4 border-t">
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
                 <Textarea bind:value={resumeStore.resumeData.projects[index].description} placeholder="What did you build?" />
               </div>
               
               <!-- TODO: Technologies tag input -->

               <div class="flex justify-end pt-2">
                 <Button variant="destructive" size="sm" onclick={() => removeProject(index)}>
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
