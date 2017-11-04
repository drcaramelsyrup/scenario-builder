import ELImprov from './el-improv';
import Improv from 'improv';
import yaml from 'js-yaml';
import fs from 'fs-jetpack';

// Load data
const grammarData = yaml.load(fs.read('grammar.yaml'));

// Create generator
const generator = new ELImprov(grammarData, {
	// Allow for preconditions
	filters: [Improv.filters.mismatchFilter()],
	// Allow for postconditions
	reincorporate: true
});

const model = {};

// Generate text
console.log(generator.gen('root', model));
console.log(model);
 