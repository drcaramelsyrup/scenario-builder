import Improv from 'improv';

export default class ELImprov extends Improv {

	constructor(snippets, options = {}) {
		/* Include postconditions to formulate exclusion logic. */
		super(snippets, options);
		if (typeof options.postconditions === 'undefined')
			options.postconditions = false;
		this.postconditions = Boolean(options.postconditions);
	}

	getPostconditionsIndex() {
		return 2;
	}

	selectPhrase(groups = {}, model = {}) {
		/* Use postconditions if requested. */
		/* We're copying the original implementation,
			because we have to insert some side effects. */
		// DUPLICATED
		const phrases = this.flattenGroups(groups);
		if (phrases.length === 0) {
			if (this.audit) {
				console.log(groups);
				console.log(model);
			}
			throw new Error('Ran out of phrases in ${groups} while generating ${this.__currentSnippet}');
		}
		if (!this)
			console.log('not this either!');
		const chosen = phrases[Math.floor(this.rng() * phrases.length)];
		if (this.reincorporate)
			this.mergeTags(model, chosen[1]);
		if (Array.isArray(chosen[1])) {
			this.tagHistory = chosen[1].concat(this.tagHistory);
		}
		// END DUPLICATED
		if (this.postconditions)
			this.mergeTags(model, chosen[this.getPostconditionsIndex()]);

		return chosen[0];
	}

	flattenGroups(groups = {}) {
		/* This duplicates the original implementation
			while including postconditions. */
		if (!this.postconditions)
			return super.flattenGroups(groups);
		return groups
			.map(o => o.groups.phrases.map(i => [i, o.groups.tags, o.group.postconditions]))
			.reduce((a, b) => a.concat(b), []);

	}

}
