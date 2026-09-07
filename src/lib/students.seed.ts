import type { Student } from './types';
import raw from './assets/students.csv?raw';

// Roster source: assets/students.csv, exported as "No.,Name" with
// Name = "SURNAME, GIVEN NAMES" (quoted, all caps). Replace that file to
// update the class list — this parses it into Student records on load.
const ROW = /^(\d+),"([^"]+)"\s*$/;

function toTitleCase(value: string): string {
	return value
		.toLowerCase()
		.replace(/(^|[\s'-])([a-zà-ÿ])/g, (_match, sep: string, ch: string) => sep + ch.toUpperCase());
}

// A bare two-letter uppercase token (e.g. "JV") is an initialism, not a
// word — title-casing it would turn it into "Jv", so leave it alone.
function toTitleCaseToken(token: string): string {
	return /^[A-Z]{2}$/.test(token) ? token : toTitleCase(token);
}

export const SEED_STUDENTS: Student[] = raw
	.split('\n')
	.map((line) => line.trim())
	.filter((line) => ROW.test(line))
	.map((line) => {
		const [, no, rawName] = line.match(ROW)!;
		const [surname, given] = rawName.split(',').map((s) => s.trim());
		const givenTokens = given.split(' ').map(toTitleCaseToken);

		return {
			id: no.padStart(2, '0'),
			name: `${givenTokens.join(' ')} ${toTitleCase(surname)}`,
			shortName: givenTokens.slice(0, 2).join(' '),
			active: true
		};
	});
