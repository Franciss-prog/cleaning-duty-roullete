<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { getStudents, getRounds, getSettings, setStudentActive } from '$lib/storage';
	import type { Student } from '$lib/types';

	const settings = getSettings();
	let students = $state<Student[]>(getStudents());

	const mostRecentRound = getRounds().at(-1);
	const recentlyCleanedIds = new Set(mostRecentRound?.studentIds ?? []);

	function toggleActive(student: Student) {
		const next = !student.active;
		setStudentActive(student.id, next);
		students = students.map((s) => (s.id === student.id ? { ...s, active: next } : s));
	}
</script>

<div class="flex min-h-dvh flex-col items-center bg-neutral-50 px-6 py-10 text-neutral-900">
	<Header title="STUDENTS" subtitle={settings.className} />

	<main class="mt-10 w-full max-w-sm flex-1">
		<ul class="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
			{#each students as student (student.id)}
				<li class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 text-sm">
					<span class:opacity-40={!student.active}>{student.name}</span>
					<div class="flex shrink-0 items-center gap-3">
						{#if !student.active}
							<span class="text-neutral-300">Unavailable</span>
						{:else if recentlyCleanedIds.has(student.id)}
							<span class="text-neutral-400">● Recently cleaned</span>
						{:else}
							<span class="text-neutral-300">○ Available</span>
						{/if}
						<button
							onclick={() => toggleActive(student)}
							class="rounded-lg border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-600 active:scale-[0.97]"
						>
							{student.active ? 'Mark Unavailable' : 'Mark Available'}
						</button>
					</div>
				</li>
			{/each}
		</ul>
	</main>
</div>
