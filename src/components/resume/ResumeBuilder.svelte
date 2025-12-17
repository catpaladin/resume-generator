<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import PersonalSection from './form/PersonalSection.svelte';
  import ExperienceSection from './form/ExperienceSection.svelte';
  import EducationSection from './form/EducationSection.svelte';
  import SkillsSection from './form/SkillsSection.svelte';
  import ProjectsSection from './form/ProjectsSection.svelte';
  import Button from '../ui/button/button.svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
  
  // Section definitions for navigation
  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' }
  ] as const;

  // Active section management
  let activeSection = $derived(resumeStore.uiState.activeSection);
  
  function setActiveSection(id: string) {
    resumeStore.setUIState({ activeSection: id });
  }
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
  <!-- Sidebar Navigation -->
  <Card class="lg:col-span-1 h-fit">
    <CardContent class="p-4 space-y-2">
      {#each sections as section}
        <Button 
          variant={activeSection === section.id ? "default" : "ghost"} 
          class="w-full justify-start"
          onclick={() => setActiveSection(section.id)}
        >
          {section.label}
        </Button>
      {/each}
    </CardContent>
  </Card>

  <!-- Main Form Area -->
  <div class="lg:col-span-3">
    <Card>
      <CardHeader>
        <CardTitle>{sections.find(s => s.id === activeSection)?.label}</CardTitle>
        <CardDescription>
          Fill in your information below. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        {#if activeSection === 'personal'}
          <PersonalSection />
        {:else if activeSection === 'experience'}
          <ExperienceSection />
        {:else if activeSection === 'education'}
          <EducationSection />
        {:else if activeSection === 'skills'}
          <SkillsSection />
        {:else if activeSection === 'projects'}
          <ProjectsSection />
        {/if}
      </CardContent>
      <CardFooter class="flex justify-between">
         <!-- Simple navigation buttons -->
         {@const currentIndex = sections.findIndex(s => s.id === activeSection)}
         <Button 
           variant="outline" 
           disabled={currentIndex === 0}
           onclick={() => setActiveSection(sections[currentIndex - 1].id)}
         >
           Previous
         </Button>
         <Button 
           disabled={currentIndex === sections.length - 1}
           onclick={() => setActiveSection(sections[currentIndex + 1].id)}
         >
           Next
         </Button>
      </CardFooter>
    </Card>
  </div>
</div>
