/* @flow */
import ELTree from './el-tree';
import ELNode from './el-node';
import Practice from './practice'
import type { ModalOperator, Precondition, Postcondition } from './el-types'

type ELFragment = { value: string, operator: ModalOperator };

const practice = (tree: ELTree, practice: Practice, ...args: Array<string>) => {
	if (preconditions(tree, practice, args))
		postconditions(tree, practice, args);
};

const preconditions = (tree: ELTree, practice: Practice, args: Array<string> = []) => {
	practice.preconditions.forEach((precondition) => {
		if (!satisfies(tree, substitute(practice, precondition[0], args)))
			return false;
	});
	return true;
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
		if (typeof node === 'undefined')
			throw new Error('undefined node when evaluating claim!');

		const fragment = nodeFragments[i];
		let child = matchingChild(node, fragment);

		// Insert a new fragment if not yet claimed
		if (typeof child === 'undefined') {
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
	if (typeof retrieved === 'undefined')
		throw new Error('Could not find node for \''+statement+'\' in tree '+treeRoot.value+'!');

	return retrieved.children.map((child) => child.value);
};

const retrieve = (tree: ELTree, statement: string) => {
	const nodeFragments = parseNodeFragments(statement);
	const rootFragment = nodeFragments.shift();
	if (rootFragment.value !== tree.root.value || rootFragment.operator !== '')
		throw new Error('Could not find root node in tree!');

	return retrieveNode(tree.root, nodeFragments);
};

const retrieveNode = (node: ELNode, childFragments: Array<ELFragment> = []) => {
	if (childFragments.length === 0)
		return node;

	const childFragment = childFragments.shift();
	const child = satisfyingChild(node, childFragment);

	if (typeof child === 'undefined')
		return child;	// invalid node

	return retrieveNode(child, childFragments);
};

const satisfyingChild = (node: ELNode, childFragment: ELFragment) => {
	return findChild(node, childFragment, true);
};

const matchingChild = (node: ELNode, childFragment: ELFragment) => {
	return findChild(node, childFragment, false);
};

const findChild = (node: ELNode, childFragment: ELFragment, bLeastUpperBound: boolean) => {
	if (node.operator === '' && node.children.length !== 0)
		throw new Error('Invalid node \''+node.value+'\' with empty operator and non-zero children');

	if (!(node.operator === '.' || node.operator === '!' || node.operator === ''))
		throw new Error('Invalid node \''+node.value+'\' with unrecognized operator \''+node.operator+'\'');

	if (node.children.length === 0 && (node.operator === '.' || node.operator === '!'))
		throw new Error('Invalid node \''+node.value+'\' with operator \''+node.operator+'\' and no children');

	if (node.operator === '!' && node.children.length > 1)
		throw new Error('Invalid node \''+node.value+'\' with operator \'!\' and more than one child');

	// Child's parent operator should be satisfied by (or match) current operator
	if (bLeastUpperBound && node.operator === '.' && childFragment.operator === '!')
		return undefined;
	else if (!bLeastUpperBound && node.operator !== childFragment.operator)
		return undefined;

	return node.children.find((child) => { return child.value === childFragment.value; });
}

const parseNodeFragments = (statement: string) => {
	const values = statement.split(/[.!]/);
 	return values.map((word, idx) => {
 		const parentOperatorIdx = values.slice(0, idx).reduce((sum, val) => {
			return sum + val.length + 1;
		}, -1);
		return {
			operator: idx != 0
				? ((statement[parentOperatorIdx]: any): ModalOperator)
				: '', // remember to leave room for the empty operator at the start
			value: word
		};
	});
	
};

export { claim, children, satisfies, practice, substitute };
