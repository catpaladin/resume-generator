<script lang="ts">
  import type { Project } from '@/types/resume';

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();

  const hasContent = $derived(
    projects && projects.some((project) => project.name || project.description)
  );

  function isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }
</script>

{#if hasContent}
  <section class="space-y-3">
    <h2 class="text-sm font-bold tracking-widest uppercase text-primary border-l-4 border-primary pl-3 bg-primary/5 py-1">
      PROJECTS
    </h2>
    <div class="space-y-4">
      {#each projects as project (project.id)}
        {#if project.name}
          <div class="space-y-1">
            <div class="flex items-baseline justify-between gap-4">
              <h3 class="text-[15px] font-bold text-foreground">
                {project.name}
              </h3>
              {#if project.url && isValidUrl(project.url)}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs font-semibold text-primary hover:underline lowercase tracking-normal"
                >
                  {project.url}
                </a>
              {/if}
            </div>
            {#if project.description}
              <p class="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {project.description}
              </p>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
