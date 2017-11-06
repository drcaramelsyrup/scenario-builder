/* @flow */
import ELTree from './el-tree';
import ELNode from './el-node';

const satisfies = (tree: ELTree, statement: string) => {
	return typeof retrieve(tree, statement) !== 'undefined';
};

const claim = (tree: ELTree, statement: string) => {
	const treeRoot = tree.root;
	if (treeRoot.isRoot !== true)
		throw new Error('Given tree has no root');
	if (treeRoot.value == null)
		throw new Error('Root has no value');

	const nodeValues = parseNodeValues(statement);
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

const children = (tree: ELTree, statement: string) => {
	const treeRoot = tree.root;
	const retrieved = retrieve(tree, statement);
	if (typeof retrieved === 'undefined')
		throw new Error('Could not find node for \''+statement+'\' in tree '+treeRoot.value+'!');

	return retrieved.children.map((child) => child.value);
};

const retrieve = (tree: ELTree, nodeValue: string) => {
	const nodeValues = parseNodeValues(nodeValue);
	const rootValue = nodeValues.shift();
	if (rootValue !== tree.root.value)
		throw new Error('Could not find root node in tree!');

	return retrieveNode(tree.root, nodeValues);
};

const retrieveNode = (node: ELNode, childValues: Array<string> = []) => {
	if (childValues.length === 0)
		return node;

	const childValue = childValues.shift();
	const child = childWithValue(node, childValue);

	if (typeof child === 'undefined')
		return child;	// invalid node

	return retrieveNode(child, childValues);
};

const childWithValue = (node: ELNode, childValue: string = '') => {
	if (node.operator === '' && node.children.length !== 0)
		throw new Error('Invalid node \''+node.value+'\' with empty operator and non-zero children');

	if (!(node.operator === '.' || node.operator === '!' || node.operator === ''))
		throw new Error('Invalid node \''+node.value+'\' with unrecognized operator \''+node.operator+'\'');

	if (node.children.length === 0 && node.operator === '.' || node.operator === '!')
		throw new Error('Invalid node \''+node.value+'\' with operator \''+node.operator+'\' and no children');

	return node.children.find((child) => { return child.value === childValue; });
};

const parseNodeValues = (statement: string) => {
	return statement.split(/[.!]+/);
};

export { claim, children, satisfies };
