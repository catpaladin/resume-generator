<script lang="ts">
  import type { Skill } from '@/types/resume';
  import { groupSkillsByCategory } from '@/lib/skills-utils';

  interface Props {
    skills: Skill[];
  }

  let { skills }: Props = $props();

  const hasContent = $derived(
    skills && skills.some((skill) => skill.name)
  );

  const groupedSkills = $derived(
    hasContent ? groupSkillsByCategory(skills) : {}
  );

  const hasGroupedSkills = $derived(
    Object.keys(groupedSkills).length > 0
  );
</script>

{#if hasContent && hasGroupedSkills}
  <section>
    <h2 class="mb-2 border-b border-border pb-1 text-base font-bold uppercase text-primary">
      SKILLS
    </h2>
    {#each Object.entries(groupedSkills) as [category, categorySkills]}
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold uppercase text-primary">
          {category}
        </h3>
        <div class="flex flex-wrap gap-2 pt-2">
          {#each categorySkills as skill}
            {#if skill.name}
              <span class="rounded-full border border-white bg-black px-2 py-1 text-xs font-medium text-white dark:border-black dark:bg-white dark:text-black">
                {skill.name}
              </span>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </section>
{/if}
