<script lang="ts">
  import { resumeStore } from '@/store/resume.svelte';
  import { Card } from '@/components/ui/card';
  import Button from '@/components/ui/button/button.svelte';
  import { Download } from 'lucide-svelte';
  import HeaderSection from './HeaderSection.svelte';
  import SkillsSection from './SkillsSection.svelte';
  import ExperienceSection from './ExperienceSection.svelte';
  import EducationSection from './EducationSection.svelte';
  import ProjectsSection from './ProjectsSection.svelte';

  // Reactive data from store
  const resumeData = $derived(resumeStore.resumeData);

  // Print/PDF export functionality
  async function handlePrint() {
    // Get current theme
    const isDark = document.documentElement.classList.contains('dark');
    
    // Temporarily switch to light mode for printing
    if (isDark) {
      document.documentElement.classList.remove('dark');
    }
    
    // Wait for theme to apply
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Trigger print
    window.print();
    
    // Restore dark mode after print
    if (isDark) {
      setTimeout(() => {
        document.documentElement.classList.add('dark');
      }, 100);
    }
  }
</script>

<Card class="bg-card p-6">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-xl font-bold text-foreground">Resume Preview</h2>
    <Button onclick={handlePrint} class="flex items-center gap-2">
      <Download size={18} />
      Export PDF
    </Button>
  </div>

  <div class="space-y-6" id="resume-preview">
    <HeaderSection data={resumeData.personal} />
    <SkillsSection skills={resumeData.skills} />
    <ExperienceSection experiences={resumeData.experience} />
    <EducationSection education={resumeData.education} />
    <ProjectsSection projects={resumeData.projects} />
  </div>
</Card>

<style global>
  @media print {
    @page {
      margin: 0.5in;
    }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
</style>
