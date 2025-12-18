<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { formatPhoneNumber } from '@/lib/utils';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Textarea from '../../ui/textarea/textarea.svelte';

  function handlePhoneInput(e: Event) {
    const input = e.target as HTMLInputElement;
    resumeStore.resumeData.personal.phone = formatPhoneNumber(input.value);
  }
</script>

<div class="grid gap-8 p-1 overflow-visible">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <Label for="fullName" class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</Label>
      <Input id="fullName" bind:value={resumeStore.resumeData.personal.fullName} placeholder="Jane Doe" />
    </div>

    <div class="space-y-2">
      <Label for="email" class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</Label>
      <Input id="email" type="email" bind:value={resumeStore.resumeData.personal.email} placeholder="jane@example.com" />
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <Label for="phone" class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</Label>
      <Input 
        id="phone" 
        type="tel" 
        value={resumeStore.resumeData.personal.phone} 
        oninput={handlePhoneInput}
        placeholder="555-555-5555" 
      />
    </div>
    
    <div class="space-y-2">
      <Label for="location" class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location</Label>
      <Input id="location" bind:value={resumeStore.resumeData.personal.location} placeholder="City, State" />
    </div>
  </div>

  <div class="space-y-2">
    <Label for="linkedin" class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">LinkedIn Profile URL</Label>
    <Input id="linkedin" type="url" bind:value={resumeStore.resumeData.personal.linkedin} placeholder="https://linkedin.com/in/..." />
  </div>

  <div class="space-y-2">
    <Label for="summary" class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Professional Summary</Label>
    <Textarea 
        id="summary" 
        bind:value={resumeStore.resumeData.personal.summary} 
        placeholder="Brief overview of your professional background..." 
        autoresize={true}
        rows={4} 
    />
  </div>
</div>
