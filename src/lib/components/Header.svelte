<script lang="ts">
	import { resolve } from '$app/paths';

	let { title, subtitle }: { title: string; subtitle: string } = $props();

	let menuOpen = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/history', label: 'History' },
		{ href: '/students', label: 'Students' },
		{ href: '/settings', label: 'Settings' }
	] as const;
</script>

<header class="relative flex w-full max-w-sm items-start justify-between">
	<div>
		<h1 class="text-sm font-semibold tracking-widest text-neutral-500">{title}</h1>
		<p class="text-2xl font-bold">{subtitle}</p>
	</div>

	<div class="relative">
		<button
			onclick={() => (menuOpen = !menuOpen)}
			class="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
			aria-label="Menu"
		>
			⋯
		</button>

		{#if menuOpen}
			<button
				class="fixed inset-0 z-10 cursor-default"
				aria-label="Close menu"
				onclick={() => (menuOpen = false)}
			></button>
			<nav
				class="absolute top-10 right-0 z-20 w-40 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
			>
				{#each links as link (link.href)}
					<a
						href={resolve(link.href)}
						class="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
						onclick={() => (menuOpen = false)}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</header>
