<script lang="ts">
	import { cn } from "@/lib/utils";
    import { tick } from 'svelte';

	let { 
        class: className, 
        ref = $bindable(null), 
        value = $bindable(), 
        autoresize = false,
        rows = 1,
        ...restProps 
    }: any = $props();

    function adjustHeight() {
        if (!autoresize || !ref) return;
        ref.style.height = 'auto';
        if (ref.scrollHeight > 0) {
            ref.style.height = ref.scrollHeight + 'px';
        }
    }

    // Effect to handle value changes
    $effect(() => {
        if (autoresize && value !== undefined) {
            tick().then(adjustHeight);
        }
    });

    // Effect to handle visibility changes (e.g. accordion expansion)
    $effect(() => {
        if (autoresize && ref) {
            const observer = new ResizeObserver(() => {
                adjustHeight();
            });
            observer.observe(ref);
            return () => observer.disconnect();
        }
    });
</script>

<textarea
	bind:this={ref}
	bind:value
    {rows}
	class={cn(
		"flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        !autoresize && "min-h-[80px]",
        autoresize && "resize-none overflow-hidden",
		className
	)}
	oninput={(e) => {
        if (autoresize) adjustHeight();
        if (restProps.oninput) restProps.oninput(e);
    }}
    {...restProps}
></textarea>
