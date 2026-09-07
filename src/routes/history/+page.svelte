<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { getHistory, getStudents, getSettings } from '$lib/storage';

	const settings = getSettings();
	const students = getStudents();
	const studentMap = new Map(students.map((s) => [s.id, s]));

	const rounds = getHistory();
	const items = rounds.map((round, i) => ({
		round,
		isNewCycleGroup: i === 0 || rounds[i - 1].cycleId !== round.cycleId
	}));

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="flex min-h-dvh flex-col items-center bg-neutral-50 px-6 py-10 text-neutral-900">
	<Header title="HISTORY" subtitle={settings.className} />

	<main class="mt-10 w-full max-w-sm flex-1">
		{#if items.length === 0}
			<p class="mt-16 text-center text-sm text-neutral-300">No rounds yet.</p>
		{:else}
			<ul class="space-y-4">
				{#each items as item (item.round.id)}
					{#if item.isNewCycleGroup}
						<li class="pt-2 text-xs font-semibold tracking-widest text-neutral-400">CYCLE</li>
					{/if}
					<li class="rounded-xl border border-neutral-200 bg-white p-4">
						<div class="flex items-baseline justify-between">
							<span class="text-sm font-semibold">Round {item.round.roundNumber}</span>
							<span class="text-xs text-neutral-400">{formatDate(item.round.date)}</span>
						</div>
						<ul class="mt-2 space-y-1 text-sm text-neutral-600">
							{#each item.round.studentIds as id (id)}
								<li>{studentMap.get(id)?.shortName ?? 'Unknown'}</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		{/if}
	</main>
</div>
