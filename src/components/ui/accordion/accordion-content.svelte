<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "@/lib/utils";

	let { class: className, children, ...restProps }: AccordionPrimitive.ContentProps = $props();
</script>

<AccordionPrimitive.Content
	class={cn(
		"text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=open]:overflow-visible overflow-hidden",
		className
	)}
	{...restProps}
>
	<div class="pb-6 pt-0 px-1">
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
