<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/Header.svelte';
	import { getSettings, saveSettings, resetRotation } from '$lib/storage';

	const initial = getSettings();
	let className = $state(initial.className);
	let studentsPerRound = $state(initial.studentsPerRound);
	let saved = $state(false);

	let confirming = $state(false);
	let confirmText = $state('');

	function save() {
		saveSettings({
			className: className.trim() || 'BA 3101',
			studentsPerRound: Math.max(1, Math.floor(studentsPerRound) || 1)
		});
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	function confirmReset() {
		if (confirmText !== 'RESET') return;
		resetRotation();
		goto(resolve('/'));
	}
</script>

<div class="flex min-h-dvh flex-col items-center bg-neutral-50 px-6 py-10 text-neutral-900">
	<Header title="SETTINGS" subtitle={initial.className} />

	<main class="mt-10 w-full max-w-sm flex-1 space-y-8">
		<div>
			<label for="className" class="text-xs font-semibold tracking-widest text-neutral-400">
				CLASS NAME
			</label>
			<input
				id="className"
				bind:value={className}
				class="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
			/>
		</div>

		<div>
			<label for="perRound" class="text-xs font-semibold tracking-widest text-neutral-400">
				STUDENTS PER ROUND
			</label>
			<input
				id="perRound"
				type="number"
				min="1"
				bind:value={studentsPerRound}
				class="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
			/>
			<!-- The final-round exclusion rule assumes a fixed group size across a
			     cycle; changing this mid-cycle is stored as-is, no migration. -->
			<p class="mt-1 text-xs text-neutral-300">Applies to future rounds only.</p>
		</div>

		<button
			onclick={save}
			class="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white active:scale-[0.98]"
		>
			{saved ? '✓ Saved' : 'Save Settings'}
		</button>

		<div class="border-t border-neutral-200 pt-8">
			{#if !confirming}
				<button
					onclick={() => (confirming = true)}
					class="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600"
				>
					Reset Rotation
				</button>
			{:else}
				<div class="space-y-3 rounded-xl border border-red-200 p-4">
					<p class="text-sm text-red-600">
						This clears all rounds and cycles. Students and settings are kept. Type RESET to
						confirm.
					</p>
					<input
						bind:value={confirmText}
						placeholder="RESET"
						class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
					/>
					<div class="flex gap-2">
						<button
							onclick={() => {
								confirming = false;
								confirmText = '';
							}}
							class="flex-1 rounded-lg border border-neutral-300 py-2 text-sm"
						>
							Cancel
						</button>
						<button
							onclick={confirmReset}
							disabled={confirmText !== 'RESET'}
							class="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white disabled:opacity-40"
						>
							Confirm Reset
						</button>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>
