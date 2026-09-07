export type Student = {
	id: string;
	name: string; // full name, e.g. "Francis Gil B. Abarintos"
	shortName: string; // used in GC announcement, e.g. "Francis Gil"
	active: boolean;
};

export type Round = {
	id: string;
	cycleId: string;
	roundNumber: number;
	date: string; // ISO date
	studentIds: string[]; // the 5 (or 4) selected
};

export type Cycle = {
	id: string;
	startedAt: string;
	completedAt: string | null;
	status: 'active' | 'completed';
};
