<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "@/lib/utils";

	let { class: className, children, ...restProps }: AccordionPrimitive.ItemProps = $props();
</script>

<AccordionPrimitive.Item class={cn("border-b", className)} {...restProps}>
	{@render children?.()}
</AccordionPrimitive.Item>
