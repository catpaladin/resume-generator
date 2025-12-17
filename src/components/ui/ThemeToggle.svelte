<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	
	let { class: className = "" } = $props();
	let theme = $state("light");
	
	$effect(() => {
		if (typeof window !== "undefined") {
			const isDark = document.documentElement.classList.contains("dark");
			theme = isDark ? "dark" : "light";
		}
	});

	function toggleTheme() {
		const isDark = theme === "dark";
		const root = document.documentElement;
		
		if (isDark) {
			root.classList.remove("dark");
			theme = "light";
			localStorage.setItem("theme", "light");
		} else {
			root.classList.add("dark");
			theme = "dark";
			localStorage.setItem("theme", "dark");
		}
	}
</script>

<button
	class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground {className}"
	onclick={toggleTheme}
	aria-label="Toggle theme"
>
	<div class="relative h-4 w-4">
		<div class="absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">
			<Sun class="h-4 w-4" />
		</div>
		<div class="absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">
			<Moon class="h-4 w-4" />
		</div>
	</div>
</button>
