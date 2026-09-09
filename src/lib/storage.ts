import type { Student, Round, Cycle } from './types';
import { SEED_STUDENTS } from './students.seed';
import { startNewCycle as computeNewCyclePool } from './rotation';

export type Settings = {
	className: string;
	studentsPerRound: number;
};

const DEFAULT_SETTINGS: Settings = { className: 'BA 3101', studentsPerRound: 5 };

const KEYS = {
	students: 'cleaning-duty:students',
	studentsSeedHash: 'cleaning-duty:students-seed-hash',
	rounds: 'cleaning-duty:rounds',
	cycles: 'cleaning-duty:cycles',
	settings: 'cleaning-duty:settings'
} as const;

/** Cheap fingerprint so a change to the seed roster (e.g. editing students.csv) invalidates what's cached in localStorage. */
function hashSeed(students: Student[]): string {
	const str = JSON.stringify(students);
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 31 + str.charCodeAt(i)) | 0;
	}
	return hash.toString(36);
}

function read<T>(key: string, fallback: T): T {
	const raw = localStorage.getItem(key);
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function write<T>(key: string, value: T): void {
	localStorage.setItem(key, JSON.stringify(value));
}

export function getStudents(): Student[] {
	const currentHash = hashSeed(SEED_STUDENTS);
	const existing = read<Student[]>(KEYS.students, []);

	if (existing.length > 0 && localStorage.getItem(KEYS.studentsSeedHash) === currentHash) {
		return existing;
	}

	write(KEYS.students, SEED_STUDENTS);
	localStorage.setItem(KEYS.studentsSeedHash, currentHash);
	return SEED_STUDENTS;
}

export function getRounds(): Round[] {
	return read<Round[]>(KEYS.rounds, []);
}

/** Rounds, most recent first. */
export function getHistory(): Round[] {
	return getRounds().slice().reverse();
}

export function getCycles(): Cycle[] {
	return read<Cycle[]>(KEYS.cycles, []);
}

export function getRoundsForCycle(cycleId: string): Round[] {
	return getRounds().filter((r) => r.cycleId === cycleId);
}

export function getFinalRoundOfCycle(cycleId: string): Round | undefined {
	return getRoundsForCycle(cycleId).reduce<Round | undefined>(
		(latest, r) => (!latest || r.roundNumber > latest.roundNumber ? r : latest),
		undefined
	);
}

export function saveRound(round: Round): void {
	write(KEYS.rounds, [...getRounds(), round]);
}

export function completeCycle(cycleId: string): void {
	const cycles = getCycles().map((c) =>
		c.id === cycleId
			? { ...c, status: 'completed' as const, completedAt: new Date().toISOString() }
			: c
	);
	write(KEYS.cycles, cycles);
}

/**
 * Returns the currently active cycle. If no cycle has ever been started,
 * creates the first one. If the most recent cycle is completed, returns
 * undefined — starting the next cycle is a deliberate action, see
 * startNextCycle().
 */
export function getActiveCycle(): Cycle | undefined {
	const cycles = getCycles();
	const active = cycles.find((c) => c.status === 'active');
	if (active) return active;
	if (cycles.length > 0) return undefined;

	const cycle: Cycle = {
		id: crypto.randomUUID(),
		startedAt: new Date().toISOString(),
		completedAt: null,
		status: 'active'
	};
	write(KEYS.cycles, [cycle]);
	return cycle;
}

/** Explicitly starts the next cycle after the previous one completed. */
export function startNextCycle(): Cycle {
	const cycle: Cycle = {
		id: crypto.randomUUID(),
		startedAt: new Date().toISOString(),
		completedAt: null,
		status: 'active'
	};
	write(KEYS.cycles, [...getCycles(), cycle]);
	return cycle;
}

/**
 * Active students not yet used in the given cycle's rounds. For a cycle's
 * very first round, also excludes whoever was in the immediately preceding
 * cycle's final round, so they don't clean back-to-back across the cycle
 * boundary (see rotation.ts's startNewCycle).
 */
export function getAvailablePool(cycleId: string): Student[] {
	const activeStudents = getStudents().filter((s) => s.active);
	const roundsInCycle = getRoundsForCycle(cycleId);

	if (roundsInCycle.length === 0) {
		const cycles = getCycles();
		const idx = cycles.findIndex((c) => c.id === cycleId);
		const previousCycle = idx > 0 ? cycles[idx - 1] : undefined;
		const finalRound = previousCycle ? getFinalRoundOfCycle(previousCycle.id) : undefined;
		const finalRoundStudents = activeStudents.filter((s) => finalRound?.studentIds.includes(s.id));
		return computeNewCyclePool(activeStudents, finalRoundStudents);
	}

	const usedIds = new Set(roundsInCycle.flatMap((r) => r.studentIds));
	return activeStudents.filter((s) => !usedIds.has(s.id));
}

export function setStudentActive(id: string, active: boolean): void {
	const students = getStudents().map((s) => (s.id === id ? { ...s, active } : s));
	write(KEYS.students, students);
}

export function getSettings(): Settings {
	return read<Settings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
	write(KEYS.settings, settings);
}

/** Clears rotation progress (rounds + cycles). Students and settings are kept. */
export function resetRotation(): void {
	localStorage.removeItem(KEYS.rounds);
	localStorage.removeItem(KEYS.cycles);
}
