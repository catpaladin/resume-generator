<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "@/lib/utils";

	let { class: className, children, ...restProps }: AccordionPrimitive.RootProps = $props();
</script>

<AccordionPrimitive.Root class={cn(className)} {...restProps}>
	{@render children?.()}
</AccordionPrimitive.Root>
