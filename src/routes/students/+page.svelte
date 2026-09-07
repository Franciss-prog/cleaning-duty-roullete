<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { getStudents, getRounds, getSettings } from '$lib/storage';

	const settings = getSettings();
	const students = getStudents();

	const mostRecentRound = getRounds().at(-1);
	const recentlyCleanedIds = new Set(mostRecentRound?.studentIds ?? []);
</script>

<div class="flex min-h-dvh flex-col items-center bg-neutral-50 px-6 py-10 text-neutral-900">
	<Header title="STUDENTS" subtitle={settings.className} />

	<main class="mt-10 w-full max-w-sm flex-1">
		<ul class="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
			{#each students as student (student.id)}
				<li class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-3 text-sm">
					<span>{student.name}</span>
					{#if recentlyCleanedIds.has(student.id)}
						<span class="shrink-0 text-neutral-400">● Recently cleaned</span>
					{:else}
						<span class="shrink-0 text-neutral-300">○ Available</span>
					{/if}
				</li>
			{/each}
		</ul>
	</main>
</div>
