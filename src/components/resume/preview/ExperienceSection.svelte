<script lang="ts">
  import type { Experience } from '@/types/resume';

  interface Props {
    experiences: Experience[];
  }

  let { experiences }: Props = $props();

  const hasContent = $derived(
    experiences && experiences.some((exp) => exp.company || exp.position)
  );
</script>

{#if hasContent}
  <section>
    <h2 class="mb-2 text-base font-bold text-foreground">
      Professional Experience
    </h2>
    <div class="space-y-4">
      {#each experiences as exp}
        {#if exp.company}
          <div class="space-y-1">
            <div class="flex items-baseline justify-between">
              <div>
                <h3 class="font-semibold text-foreground">
                  {exp.company}
                </h3>
                <div class="flex items-baseline gap-2">
                  <p class="text-sm font-medium text-foreground">
                    {exp.position}
                  </p>
                  {#if exp.location}
                    <span class="text-sm text-muted-foreground">
                      • {exp.location}
                    </span>
                  {/if}
                </div>
              </div>
              <span class="whitespace-nowrap text-sm text-muted-foreground">
                {[exp.startDate, exp.endDate].filter(Boolean).join(' - ')}
              </span>
            </div>

            {#if exp.bulletPoints.length > 0}
              <ul class="ml-4 list-disc space-y-0.5">
                {#each exp.bulletPoints as bullet}
                  {#if bullet.text}
                    <li class="overflow-visible whitespace-normal text-sm text-muted-foreground">
                      {bullet.text}
                    </li>
                  {/if}
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
