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
  <section>
    <h2 class="mb-2 text-base font-bold text-foreground">Projects</h2>
    <div class="space-y-3">
      {#each projects as project}
        {#if project.name}
          <div class="space-y-1">
            <div class="mb-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
              <h3 class="font-semibold text-foreground">
                {project.name}
              </h3>
              {#if project.link && isValidUrl(project.link)}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-0.5 break-all text-sm text-primary hover:underline sm:ml-4 sm:mt-0"
                >
                  {project.link}
                </a>
              {/if}
            </div>
            {#if project.description}
              <p class="text-sm text-muted-foreground">
                {project.description}
              </p>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
