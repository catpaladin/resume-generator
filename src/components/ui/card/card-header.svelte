<script lang="ts">
	import { cn } from "@/lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("flex flex-col space-y-1.5 p-6", className)} {...restProps}>
	{@render children?.()}
</div>
