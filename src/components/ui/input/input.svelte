<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRefs } from "bits-ui";
	import { cn } from "@/lib/utils";

	type Props = WithElementRefs<HTMLInputAttributes>;

	let { class: className, ref = $bindable(null), value = $bindable(), ...restProps }: Props = $props();
</script>

<input
	bind:this={ref}
	bind:value
	class={cn(
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	{...restProps}
/>
