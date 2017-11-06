/* @flow */

import ELNode from './el-node'

class ELTree {

	// Properties
	root: ELNode;

	constructor(rootValue: string = 'root') {
		this.root = new ELNode(rootValue);
		this.root.isRoot = true;
	}
	
}

let ELTreeType: ELTree = new ELTree();

export default ELTree;
