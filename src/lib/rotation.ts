import type { Student } from './types';

/**
 * Picks `count` random students out of `available`, without mutating input.
 * `remaining` is what's left of the pool after removal.
 */
export function selectRound(
	available: Student[],
	count: number
): { selected: Student[]; remaining: Student[] } {
	const pool = [...available];
	const selected: Student[] = [];

	const n = Math.min(count, pool.length);
	for (let i = 0; i < n; i++) {
		const index = Math.floor(Math.random() * pool.length);
		selected.push(pool.splice(index, 1)[0]);
	}

	return { selected, remaining: pool };
}

/**
 * Computes the eligible pool for round 1 of a new cycle: everyone active,
 * minus whoever was in the final round of the previous cycle (so they don't
 * clean back-to-back across the cycle boundary). If this is the very first
 * cycle, `lastRoundOfPreviousCycle` is empty and everyone is eligible.
 */
export function startNewCycle(
	allStudents: Student[],
	lastRoundOfPreviousCycle: Student[]
): Student[] {
	const excludedIds = new Set(lastRoundOfPreviousCycle.map((s) => s.id));
	return allStudents.filter((s) => s.active && !excludedIds.has(s.id));
}
