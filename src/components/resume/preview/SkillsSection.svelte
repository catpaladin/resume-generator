<script lang="ts">
  import type { Skill } from '@/types/resume';

  interface Props {
    skills: Skill[];
  }

  let { skills }: Props = $props();

  const hasContent = $derived(
    skills && skills.some((skill) => skill.name)
  );
</script>

{#if hasContent}
  <section class="space-y-3">
    <h2 class="text-sm font-bold tracking-widest uppercase text-primary border-l-4 border-primary pl-3 bg-primary/5 py-1">
      SKILLS
    </h2>
    <div class="flex flex-wrap gap-2 pt-1">
      {#each skills as skill (skill.id)}
        {#if skill.name}
          <span class="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {skill.name}
          </span>
        {/if}
      {/each}
    </div>
  </section>
{/if}
