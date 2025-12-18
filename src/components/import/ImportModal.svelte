<script lang="ts">
  import { X } from 'lucide-svelte';
  import Button from '../ui/button/button.svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
  import ImportDropzone from './ImportDropzone.svelte';
  import { fade, scale } from 'svelte/transition';

  let { show = $bindable(false) } = $props();

  function handleClose() {
    show = false;
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    transition:fade={{ duration: 200 }}
    onclick={handleClose}
    role="presentation"
  >
    <div 
      class="w-full max-w-2xl"
      transition:scale={{ duration: 200, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <Card class="shadow-xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Import Resume</CardTitle>
            <CardDescription>Upload an existing resume to get started quickly.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onclick={handleClose}>
            <X class="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ImportDropzone />
        </CardContent>
      </Card>
    </div>
  </div>
{/if}
