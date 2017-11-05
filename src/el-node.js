/* @flow */ 

type ModalOperator = '.' | '!' | '' ;

class ELNode {

	// Properties
	value: string;
	operator: ModalOperator;
	children: Array<ELNode>;
	isRoot: boolean;

	constructor(value: string = '') {
		this.value = value;
		this.operator = '';
		this.children = [];
		this.isRoot = false;
	}

}

let ELNodeType: ELNode = new ELNode('');

export default ELNode;
