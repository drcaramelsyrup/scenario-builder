const Improv = require('improv');
const yaml = require('js-yaml');
const fs = require('fs-jetpack');

// Load data
const grammarData = yaml.load(fs.read('grammar.yaml'));

// Create generator
const generator = new Improv(grammarData, {
	// Allow for preconditions
	filters: [Improv.filters.mismatchFilter()],
	// Allow for postconditions
	reincorporate: true
});

const model = {};

// Generate text
console.log(generator.gen('root', model));
console.log(model);
 