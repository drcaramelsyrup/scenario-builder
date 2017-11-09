/* @flow */
import type { Precondition, Postcondition } from './el-types';

class Practice {
	// Properties
	id: string;
	args: Array<string>;
	preconditions: Array<Precondition>;
	postconditions: Array<Postcondition>;

	constructor(id: string, args: Array<string> = [], preconditions: Array<Precondition> = [], postconditions: Array<Postcondition> = []) {
		this.id = id;
		this.args = args;
		this.preconditions = preconditions;
		this.postconditions = postconditions;
	}

}

let PracticeType: Practice = new Practice('');

export default Practice;
