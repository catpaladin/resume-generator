<script lang="ts">
	import { Label as BitsLabel } from "bits-ui";
	import { cn } from "@/lib/utils";

	let { class: className, ref = $bindable(null), children, ...restProps }: BitsLabel.RootProps = $props();
</script>

<BitsLabel.Root
	bind:ref
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</BitsLabel.Root>
