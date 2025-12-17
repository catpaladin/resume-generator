<script lang="ts">
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { WithElementRefs } from "bits-ui";
	import { cn } from "@/lib/utils";

	type Props = WithElementRefs<HTMLTextareaAttributes>;

	let { class: className, ref = $bindable(null), value = $bindable(), ...restProps }: Props = $props();
</script>

<textarea
	bind:this={ref}
	bind:value
	class={cn(
		"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	{...restProps}
/>
