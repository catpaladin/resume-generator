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
  <section class="space-y-4">
    <h2 class="text-sm font-bold tracking-widest uppercase text-primary border-l-4 border-primary pl-3 bg-primary/5 py-1">
      EXPERIENCE
    </h2>
    <div class="space-y-6">
      {#each experiences as exp (exp.id)}
        {#if exp.company || exp.position}
          <div class="space-y-2">
            <div class="flex items-baseline justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-foreground leading-tight">
                  {exp.position || 'Position Title'}
                </h3>
                <div class="flex items-center gap-2 text-sm font-semibold text-primary/80">
                  {exp.company || 'Company Name'}
                  {#if exp.location}
                    <span class="text-muted-foreground/60 font-normal text-xs uppercase tracking-wider">
                      • {exp.location}
                    </span>
                  {/if}
                </div>
              </div>
              <span class="whitespace-nowrap text-xs font-bold tabular-nums text-muted-foreground uppercase tracking-wider">
                {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
              </span>
            </div>

            {#if exp.jobDescription}
              <p class="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {exp.jobDescription}
              </p>
            {/if}

            {#if exp.bulletPoints.length > 0}
              <ul class="ml-4 list-disc space-y-1">
                {#each exp.bulletPoints as bullet (bullet.id)}
                  {#if bullet.text}
                    <li class="text-[13px] leading-relaxed text-muted-foreground/90 pl-1">
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
