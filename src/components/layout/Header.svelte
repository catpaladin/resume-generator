<script lang="ts">
	import { FileText, Download, Upload } from 'lucide-svelte';
	import ThemeToggle from '../ui/ThemeToggle.svelte';
	import { resumeStore } from '@/store/resume.svelte';

	let { class: className = "" } = $props();

    function handleExport() {
        // TODO: Implement export functionality in later task
        console.log("Export triggered");
    }

    function handleImport() {
        // TODO: Implement import modal in later task
        console.log("Import triggered");
    }
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 {className}">
	<div class="container flex h-14 items-center justify-between px-4">
		<div class="flex items-center gap-2 font-semibold">
			<FileText class="h-6 w-6 text-primary" />
			<span class="hidden sm:inline-block">Resume Generator</span>
		</div>

		<div class="flex items-center gap-2">
			<button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" onclick={handleImport}>
				<Upload class="mr-2 h-4 w-4" />
				Import
			</button>
			
            <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2" onclick={handleExport}>
				<Download class="mr-2 h-4 w-4" />
				Export PDF
			</button>

			<div class="w-px h-6 bg-border mx-2"></div>
			
			<ThemeToggle />
		</div>
	</div>
</header>
