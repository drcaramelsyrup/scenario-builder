/* @flow */

import ELTree from './el-tree';
import { claim } from './el-logic';
import Practice from './practice';
import yaml from 'js-yaml';
import fs from 'fs-jetpack';

const createPractices = (corpus: string) => {
	const	practiceData = yaml.safeLoad(fs.read(corpus));
	const practices = {};
	Object.keys(practiceData).forEach((key) => {
		practices[key] = [];
		practiceData[key].forEach((practice) => {
			practices[key].push(new Practice(
				practice.id,
				practice.args,
				practice.preconditions,
				practice.postconditions,
				practice.phrase
			));
		})
	});
	return practices;
};

const generate = () => {
	// for each year,
	// if fate (Math.random) deems it so,
	// generate a practice to perform
};

export { createPractices, generate };	// for testing
