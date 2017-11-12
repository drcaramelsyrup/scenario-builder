/* @flow */
import ELTree from './el-tree';
import ELNode from './el-node';
import type { ModalOperator } from './el-types';

export type ELFragment = { value: string, operator: ModalOperator };

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

export { parseNodeFragments, matchingChild, satisfyingChild, retrieve };
