<script lang="ts">
  import type { PersonalInfo } from '@/types/resume';

  interface Props {
    data: PersonalInfo;
  }

  let { data }: Props = $props();

  // Filter out empty or undefined contact info
  const contactInfo = $derived(
    [data?.location, data?.email, data?.phone, data?.linkedin].filter(Boolean)
  );
</script>

{#if data}
  <section class="space-y-4 text-center border-b pb-8 border-border/30">
    <h1 class="text-4xl font-extrabold tracking-tight text-foreground uppercase">{data.fullName || 'YOUR NAME'}</h1>

    {#if contactInfo.length > 0}
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground/80">
        {#each contactInfo as info}
            <span class="flex items-center gap-1.5 whitespace-nowrap">
                {info}
            </span>
        {/each}
      </div>
    {/if}

    {#if data.summary}
      <div class="mt-6 text-left max-w-2xl mx-auto">
        <p class="text-[14px] leading-relaxed text-muted-foreground text-center">{data.summary}</p>
      </div>
    {/if}
  </section>
{/if}
