<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import Input from '../../ui/input/input.svelte';
  import Label from '../../ui/label/label.svelte';
  import Textarea from '../../ui/textarea/textarea.svelte';
</script>

<div class="grid gap-4">
  <div class="space-y-2">
    <Label for="fullName">Full Name</Label>
    <Input id="fullName" bind:value={resumeStore.resumeData.personal.fullName} placeholder="Jane Doe" />
  </div>

  <div class="space-y-2">
    <Label for="email">Email</Label>
    <Input id="email" type="email" bind:value={resumeStore.resumeData.personal.email} placeholder="jane@example.com" />
  </div>

  <div class="space-y-2">
    <Label for="phone">Phone</Label>
    <Input id="phone" type="tel" bind:value={resumeStore.resumeData.personal.phone} placeholder="(555) 555-5555" />
  </div>
  
  <div class="space-y-2">
    <Label for="location">Location</Label>
    <Input id="location" bind:value={resumeStore.resumeData.personal.location} placeholder="City, State" />
  </div>

  <div class="space-y-2">
    <Label for="linkedin">LinkedIn Profile</Label>
    <Input id="linkedin" type="url" bind:value={resumeStore.resumeData.personal.linkedin} placeholder="https://linkedin.com/in/..." />
  </div>

  <div class="space-y-2">
    <Label for="summary">Professional Summary</Label>
    <Textarea id="summary" bind:value={resumeStore.resumeData.personal.summary} placeholder="Brief overview of your professional background..." class="min-h-[120px]" />
  </div>
</div>
