/* @flow */
import ELTree from './el-tree';
import ELNode from './el-node';
import Practice from './practice'
import type { ModalOperator, Precondition, Compare, Postcondition } from './el-types';
import type { ELFragment } from './el-utils';
import { parseNodeFragments, matchingChild, satisfyingChild, retrieve } from './el-utils';
import { PreconditionFns } from './el-conditions';

const practice = (tree: ELTree, practice: Practice, ...args: Array<string>) => {
	if (preconditions(tree, practice, args)) {
		postconditions(tree, practice, args);
		return true;
	}
	return false;
};

const preconditions = (tree: ELTree, practice: Practice, args: Array<string> = []) => {
	return practice.preconditions.reduce((result, precondition) => {
		if (typeof precondition === 'string') {
			if (!satisfies(tree, substitute(practice, precondition, args)))
				return false;
		} else {
			if (!compare(tree, substitutedCompare(practice, precondition, args)))
				return false;
		}
		return result && true;
	}, true);
};

const postconditions = (tree: ELTree, practice: Practice, args: Array<string> = []) => {
	practice.postconditions.forEach((postcondition) => {
		claim(tree, substitute(practice, postcondition, args));
	});
};

const substitute = (practice: Practice, statement: string = '', args: Array<string> = []) => {
	if (args.length < practice.args.length)
		throw new Error('Practice expects '+practice.args.length+' arguments, only received '+args.length);

	let substituted = statement;
	args.forEach((arg, idx) => {
		if (practice.args.includes(arg))
			console.warn('At least one Practice argument is identical to the given argument! This might cause problems.');

		substituted = substituted.replace(practice.args[idx], arg);
	});
	return substituted;
};

const substitutedCompare = (practice: Practice, precondition: Compare, args: Array<string> = []): Compare => {
	if (precondition.fn.length <= 1)
		return precondition;	// nothing will change

	// Callback function itself will verify arguments
	const substituted = ({ fn: [], cmp: 0 }: Compare);
	substituted.cmp = precondition.cmp;

	substituted.fn = precondition.fn.map((statement: number | string, sIdx) => {
		if (sIdx === 0)
			return statement;	// function id
		if (typeof statement !== 'string')
			return statement;

		return args.reduce((result, arg, idx) => {
			if (practice.args.includes(arg))
				console.warn('At least one Practice argument is identical to the given argument! This might cause problems.');

			return result.replace(practice.args[idx], arg);
		}, statement);
	});
	return substituted;
}

const compare = (tree: ELTree, precondition: Compare) => {
	if (precondition.fn.length <= 0)
		throw new Error('Invalid Compare Precondition with no data!');
	const [ fnId, ...rest ] = precondition.fn;
	if (typeof fnId !== 'string')
		throw new Error('Expected first element of precondition fn to be function id');
	const callback = PreconditionFns.get(fnId);
	if (callback == null)
		throw new Error('Precondition function \''+fnId+'\' does not exist');
	return callback(tree, ...rest) === precondition.cmp;
};

const satisfies = (tree: ELTree, statement: string) => {
	return typeof retrieve(tree, statement) !== 'undefined';
};

const claim = (tree: ELTree, statement: string) => {
	const treeRoot = tree.root;
	if (treeRoot.isRoot !== true)
		throw new Error('Given tree has no root');
	if (treeRoot.value == null)
		throw new Error('Root has no value');

	const nodeFragments = parseNodeFragments(statement);
	if (nodeFragments.length === 0 || treeRoot.value !== nodeFragments.shift().value)
		return;

	let node = treeRoot;
	for (let i = 0; i < nodeFragments.length; i++) {
		if (node == null)
			throw new Error('undefined node when evaluating claim!');

		const fragment = nodeFragments[i];
		let child = matchingChild(node, fragment);

		// Insert a new fragment if not yet claimed
		if (child == null) {
			node.operator = fragment.operator;
			if (node.operator === '!') {
				// Invalidate all previous children
				node.children = [];
			}
			let newChild = new ELNode(fragment.value);
			node.children.push(newChild);
			node = newChild;
			continue;
		}

		node = child;
	}

};

const children = (tree: ELTree, statement: string) => {
	const treeRoot = tree.root;
	const retrieved = retrieve(tree, statement);
	if (retrieved == null)
		throw new Error('Could not find node for \''+statement+'\' in tree '+treeRoot.value+'!');

	return retrieved.children.map((child) => child.value);
};



export { claim, children, satisfies, practice, substitute };
