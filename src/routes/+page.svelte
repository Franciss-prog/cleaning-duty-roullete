<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { selectRound } from '$lib/rotation';
	import {
		getActiveCycle,
		getAvailablePool,
		getRoundsForCycle,
		getSettings,
		getStudents,
		saveRound,
		completeCycle,
		startNextCycle
	} from '$lib/storage';
	import type { Cycle, Student } from '$lib/types';

	const settings = getSettings();
	const students = getStudents();
	const totalActive = students.filter((s) => s.active).length;

	let cycle = $state<Cycle | undefined>(undefined);
	let pool = $state<Student[]>([]);
	let roundNumber = $state(0);
	const usedCount = $derived(totalActive - pool.length);

	let phase = $state<'idle' | 'selecting' | 'revealing' | 'done' | 'complete'>('idle');
	let selected = $state<Student[]>([]);
	let revealed = $state<Student[]>([]);
	let flickerName = $state('');
	let copied = $state(false);

	function loadCycleState() {
		cycle = getActiveCycle();
		pool = cycle ? getAvailablePool(cycle.id) : [];
		roundNumber = cycle ? getRoundsForCycle(cycle.id).length + 1 : 0;
		phase = cycle ? 'idle' : 'complete';
		selected = [];
		revealed = [];
		copied = false;
	}

	loadCycleState();

	const today = new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	function spin() {
		if (!cycle || phase === 'selecting' || phase === 'revealing' || pool.length === 0) return;
		const activeCycle = cycle;

		phase = 'selecting';
		revealed = [];
		copied = false;

		const count = Math.min(settings.studentsPerRound, pool.length);
		const { selected: picked, remaining } = selectRound(pool, count);
		selected = picked;

		const flicker = setInterval(() => {
			const s = students[Math.floor(Math.random() * students.length)];
			flickerName = s.shortName;
		}, 70);

		setTimeout(() => {
			clearInterval(flicker);
			phase = 'revealing';

			saveRound({
				id: crypto.randomUUID(),
				cycleId: activeCycle.id,
				roundNumber,
				date: new Date().toISOString(),
				studentIds: picked.map((s) => s.id)
			});
			pool = remaining;
			roundNumber += 1;
			if (remaining.length === 0) completeCycle(activeCycle.id);

			revealSequentially(picked);
		}, 1600);
	}

	function revealSequentially(picked: Student[]) {
		picked.forEach((s, i) => {
			setTimeout(() => {
				revealed = [...revealed, s];
				if (i === picked.length - 1) phase = pool.length === 0 ? 'complete' : 'done';
			}, i * 180);
		});
	}

	function startNewRotation() {
		startNextCycle();
		loadCycleState();
	}

	async function copyAnnouncement() {
		const lines = [
			`${settings.className} — Cleaning Duty`,
			'',
			"Today's assigned cleaners:",
			'',
			...selected.map((s) => s.shortName),
			'',
			'Please complete your assigned cleaning duty.'
		];
		await navigator.clipboard.writeText(lines.join('\n'));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex min-h-dvh flex-col items-center bg-neutral-50 px-6 py-10 text-neutral-900">
	<Header title="CLEANING DUTY" subtitle={settings.className} />

	<p class="mt-2 w-full max-w-sm text-sm text-neutral-400">{today}</p>

	<main class="mt-16 flex w-full max-w-sm flex-1 flex-col items-center">
		{#if phase === 'complete'}
			<div class="w-full rounded-2xl border border-neutral-200 bg-white py-8 text-center">
				<p class="text-lg font-semibold">Rotation Complete</p>
				<p class="mt-1 text-sm text-neutral-400">Everyone has cleaned this cycle.</p>
				<button
					onclick={startNewRotation}
					class="mt-6 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white active:scale-[0.98]"
				>
					Start New Rotation
				</button>
			</div>
		{:else}
			<button
				onclick={spin}
				disabled={phase === 'selecting' || phase === 'revealing'}
				class="w-full rounded-2xl bg-neutral-900 py-5 text-lg font-semibold tracking-wide text-white transition active:scale-[0.98] disabled:opacity-60"
			>
				{phase === 'selecting' || phase === 'revealing' ? 'SELECTING...' : 'SPIN'}
			</button>
		{/if}

		<section class="mt-12 w-full">
			<h2 class="mb-4 text-center text-xs font-semibold tracking-widest text-neutral-400">
				TODAY'S CLEANERS
			</h2>

			{#if phase === 'idle'}
				<p class="text-center text-sm text-neutral-300">Tap spin to select today's cleaners.</p>
			{:else if phase === 'selecting'}
				<p class="flicker text-center text-lg font-medium text-neutral-400">{flickerName}</p>
			{:else if revealed.length > 0}
				<ul class="space-y-2">
					{#each revealed as student (student.id)}
						<li
							class="reveal rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center font-medium uppercase"
						>
							{student.name}
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<button
			onclick={copyAnnouncement}
			disabled={selected.length === 0}
			class="mt-8 w-full rounded-xl border border-neutral-300 py-3 text-sm font-medium text-neutral-700 transition disabled:opacity-40"
		>
			{copied ? '✓ Copied' : 'Copy Announcement'}
		</button>

		{#if phase !== 'complete'}
			<p class="mt-10 text-xs tracking-wide text-neutral-300">
				Round {roundNumber} · {usedCount} / {totalActive}
			</p>
		{/if}
	</main>
</div>

<style>
	.flicker {
		animation: flicker 0.07s steps(1) infinite;
	}

	@keyframes flicker {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.reveal {
		animation: reveal-in 0.25s ease-out;
	}

	@keyframes reveal-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
