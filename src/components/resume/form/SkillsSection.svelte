<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { safeUUID } from '@/config/constants';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Button from '../../ui/button/button.svelte';
  import { Plus, X, ChevronUp, ChevronDown } from 'lucide-svelte';

  // Skills are often simple strings or simple objects.
  // The schema defines skills as { id, name, level }.
  
  function addSkill() {
    resumeStore.addArrayItem('skills', {
      id: safeUUID(),
      name: '',
      level: 3 // Default medium level
    });
  }

  function removeSkill(index: number) {
    resumeStore.removeArrayItem('skills', index);
  }

  function moveSkill(index: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? index - 1 : index + 1;
    if (toIndex >= 0 && toIndex < resumeStore.resumeData.skills.length) {
      resumeStore.moveArrayItem('skills', index, toIndex);
    }
  }
</script>

<div class="space-y-6 p-1 overflow-visible">
  <div class="flex justify-between items-center">
    <Label class="text-lg font-semibold">Skills List</Label>
    <Button onclick={addSkill} size="sm">
      <Plus class="mr-2 h-4 w-4" /> Add Skill
    </Button>
  </div>

  {#if resumeStore.resumeData.skills.length === 0}
     <div class="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
      No skills added yet.
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-3">
      {#each resumeStore.resumeData.skills as skill, index (skill.id)}
        <div class="flex items-center gap-2 p-2 border rounded-md bg-card group">
          <div class="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                class="text-muted-foreground hover:text-primary disabled:opacity-30" 
                onclick={() => moveSkill(index, 'up')}
                disabled={index === 0}
                title="Move Up"
            >
                <ChevronUp class="h-3 w-3" />
            </button>
            <button 
                class="text-muted-foreground hover:text-primary disabled:opacity-30" 
                onclick={() => moveSkill(index, 'down')}
                disabled={index === resumeStore.resumeData.skills.length - 1}
                title="Move Down"
            >
                <ChevronDown class="h-3 w-3" />
            </button>
          </div>
          <Input 
            bind:value={resumeStore.resumeData.skills[index].name} 
            placeholder="Skill (e.g. JavaScript)" 
            class="flex-1"
          />
          <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onclick={() => removeSkill(index)}>
            <X class="h-4 w-4" />
          </Button>
        </div>
      {/each}
    </div>
  {/if}
</div>
