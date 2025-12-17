<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Button from '../../ui/button/button.svelte';
  import { Plus, X } from 'lucide-svelte';

  // Skills are often simple strings or simple objects.
  // The schema defines skills as { id, name, level }.
  
  function addSkill() {
    resumeStore.addArrayItem('skills', {
      id: crypto.randomUUID(),
      name: '',
      level: 3 // Default medium level
    });
  }

  function removeSkill(index: number) {
    resumeStore.removeArrayItem('skills', index);
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <Label>Skills List</Label>
    <Button onclick={addSkill} size="sm" variant="outline">
      <Plus class="mr-2 h-4 w-4" /> Add Skill
    </Button>
  </div>

  {#if resumeStore.resumeData.skills.length === 0}
     <div class="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
      No skills added yet.
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each resumeStore.resumeData.skills as skill, index}
        <div class="flex items-center gap-2 p-2 border rounded-md bg-card">
          <Input 
            bind:value={resumeStore.resumeData.skills[index].name} 
            placeholder="Skill (e.g. JavaScript)" 
            class="h-8"
          />
          <!-- Could add a slider for level here if needed later -->
          <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onclick={() => removeSkill(index)}>
            <X class="h-4 w-4" />
          </Button>
        </div>
      {/each}
    </div>
  {/if}
</div>
