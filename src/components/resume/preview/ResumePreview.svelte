<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { Card } from '@/components/ui/card';
  import { FileText } from 'lucide-svelte';
  import HeaderSection from './HeaderSection.svelte';
  import SkillsSection from './SkillsSection.svelte';
  import ExperienceSection from './ExperienceSection.svelte';
  import EducationSection from './EducationSection.svelte';
  import ProjectsSection from './ProjectsSection.svelte';

  // Reactive data from store
  const resumeData = $derived(resumeStore.resumeData);
</script>

<Card id="resume-preview-container" class="bg-card p-10 shadow-lg border border-border/50 min-h-[1056px] w-full max-w-[816px] mx-auto transition-all duration-300">
  <div class="mb-10 flex items-center justify-between border-b pb-4 print:hidden">
    <h2 class="text-xl font-bold tracking-tight text-foreground/80 flex items-center gap-2">
        <FileText class="text-primary" size={20} />
        Resume Preview
    </h2>
  </div>

  <div class="space-y-8" id="resume-preview">
    <HeaderSection data={resumeData.personal} />
    <SkillsSection skills={resumeData.skills} />
    <ExperienceSection experiences={resumeData.experience} />
    <EducationSection education={resumeData.education} />
    <ProjectsSection projects={resumeData.projects} />
  </div>
</Card>