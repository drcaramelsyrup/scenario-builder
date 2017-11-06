/* @flow */
import ELTree from './el-tree';
import ELNode from './el-node';

const claim = (tree: ELTree, statement: string) => {
	const treeRoot = tree.root;
	if (treeRoot.isRoot !== true)
		throw new Error('Given tree has no root');
	if (treeRoot.value == null)
		throw new Error('Root has no value');

	const nodeValues = statement.split(/[.!]+/);
	if (nodeValues.length === 0 || treeRoot.value !== nodeValues.shift())
		return;

	let node = treeRoot;
	for (let i = 0; i < nodeValues.length; i++) {
		if (typeof node === 'undefined')
			throw new Error('undefined node when evaluating claim!');

		const val = nodeValues[i];
		let child = childWithValue(node, val);

		if (typeof child === 'undefined') {
			node.operator = '.';
			let newChild = new ELNode(val);
			node.children.push(newChild);
			node = newChild;
			continue;
		}

		node = child;
	}

};

const children = (tree: ELTree, nodeValue: string) => {
	const treeRoot = tree.root;
	return retrieve(tree, nodeValue).children.map((child) => child.value);
}

const retrieve = (tree: ELTree, nodeValue: string) => {
	const nodeValues = nodeValue.split(/[.!]+/);
	const rootValue = nodeValues.shift();
	if (rootValue !== tree.root.value)
		throw new Error('Could not find root node in tree!');

	return retrieveNode(tree.root, nodeValues);
}

const retrieveNode = (node: ELNode, childValues: Array<string> = []) => {
	if (childValues.length === 0)
		return node;

	const childValue = childValues.shift();
	const child = childWithValue(node, childValue);

	if (typeof child === 'undefined')
		throw new Error('Could not find node in tree!');

	return retrieveNode(child, childValues);
}

const childWithValue = (node: ELNode, childValue: string = '') => {
	return node.children.find((child) => { return child.value === childValue; });
}

export { claim, children };
