<script lang="ts">
  import type { Education } from '@/types/resume';

  interface Props {
    education: Education[];
  }

  let { education }: Props = $props();

  const hasContent = $derived(
    education && education.some((edu) => edu.school || edu.degree)
  );
</script>

{#if hasContent}
  <section class="space-y-3">
    <h2 class="text-sm font-bold tracking-widest uppercase text-primary border-l-4 border-primary pl-3 bg-primary/5 py-1">
      EDUCATION
    </h2>
    <div class="space-y-4">
      {#each education as edu (edu.id)}
        {#if edu.school || edu.degree}
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <h3 class="text-[15px] font-bold text-foreground">
                {edu.degree || 'Degree Title'}
              </h3>
              <p class="text-sm font-semibold text-primary/80">
                {edu.school || 'Institution Name'}
              </p>
            </div>
            {#if edu.graduationYear}
              <span class="whitespace-nowrap text-xs font-bold tabular-nums text-muted-foreground uppercase tracking-wider">
                Class of {edu.graduationYear}
              </span>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
