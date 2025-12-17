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
  <section class="space-y-2 text-center">
    <h1 class="text-2xl font-bold text-foreground">{data.fullName}</h1>

    {#if contactInfo.length > 0}
      <p class="text-sm text-muted-foreground">
        {contactInfo.join(' • ')}
      </p>
    {/if}

    {#if data.summary}
      <div class="mt-4 text-left">
        <h2 class="mb-1 text-base font-semibold text-foreground">
          Professional Summary
        </h2>
        <p class="text-sm text-muted-foreground">{data.summary}</p>
      </div>
    {/if}
  </section>
{/if}
