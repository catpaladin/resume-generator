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
  <section>
    <h2 class="mb-2 text-base font-bold text-foreground">Education</h2>
    <div class="space-y-3">
      {#each education as edu}
        {#if edu.school}
          <div class="space-y-0.5">
            <div class="flex items-baseline justify-between">
              <h3 class="font-semibold text-foreground">
                {edu.school}
              </h3>
              {#if edu.graduationYear}
                <span class="text-sm text-muted-foreground">
                  {edu.graduationYear}
                </span>
              {/if}
            </div>
            {#if edu.degree}
              <p class="text-sm text-muted-foreground">{edu.degree}</p>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
