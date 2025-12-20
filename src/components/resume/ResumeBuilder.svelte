<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import PersonalSection from './form/PersonalSection.svelte';
  import ExperienceSection from './form/ExperienceSection.svelte';
  import EducationSection from './form/EducationSection.svelte';
  import SkillsSection from './form/SkillsSection.svelte';
  import ProjectsSection from './form/ProjectsSection.svelte';
  import Button from '../ui/button/button.svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
  
  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' }
  ] as const;

  let activeSection = $derived(resumeStore.uiState.activeSection);
  
  function setActiveSection(id: string) {
    resumeStore.setUIState({ activeSection: id });
  }
</script>

<div class="w-full">
    <Card class="border-2 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader class="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div class="flex justify-between items-start">
            <div>
                <CardTitle class="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    {sections.find(s => s.id === activeSection)?.label || 'Section'}
                </CardTitle>
                <CardDescription class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    Editing module entry details
                </CardDescription>
            </div>
            <div class="bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter border border-blue-600/20">
                Live Editing
            </div>
        </div>
      </CardHeader>
      <CardContent class="p-8">
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
      <CardFooter class="flex justify-between p-8 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800">
         {@const currentIndex = sections.findIndex(s => s.id === activeSection)}
         <Button 
           variant="outline" 
           disabled={currentIndex === 0}
           onclick={() => setActiveSection(sections[currentIndex - 1].id)}
           class="font-black text-[10px] tracking-widest uppercase px-6 h-9"
         >
           Previous Section
         </Button>
         <Button 
           disabled={currentIndex === sections.length - 1}
           onclick={() => setActiveSection(sections[currentIndex + 1].id)}
           class="font-black text-[10px] tracking-widest uppercase px-6 h-9 shadow-md shadow-blue-600/10"
         >
           Next Section
         </Button>
      </CardFooter>
    </Card>
</div>
