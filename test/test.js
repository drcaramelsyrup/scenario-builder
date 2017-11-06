import { expect } from 'chai';
import ELNode from '../lib/el-node';
import ELTree from '../lib/el-tree';
import { claim, children, satisfies } from '../lib/el-logic';
import { claimTests, satisfiesTests } from './test-data';

const testInit = (tree, value) => {
	expect(tree.root).to.have.a.property('value', value);
	expect(tree.root).to.have.a.property('operator', '');
	expect(tree.root.children).to.deep.equal([]);
};

describe('ELNode', () => {

	describe('#constructor()', () => {
		it('should have a default value of an empty string', () => {
			let newNode = new ELNode();
			expect(newNode.value).to.be.a('string').and.to.equal('');
		});
		it('should create a new node object with a value', () => {
			let newNode = new ELNode('test');
			expect(newNode.value).to.equal('test');
		});
		it('should have an unassigned operator property', () => {
			let newNode = new ELNode();
			expect(newNode.operator).to.be.a('string').and.to.equal('');
		});
		it('should have unassigned leaf propositions', () => {
			let newNode = new ELNode();
			expect(newNode.children).to.be.an('array').and.to.deep.equal([]);
		});
		it('should not be a root node by default', () => {
			let newNode = new ELNode();
			expect(newNode).to.have.a.property('isRoot', false);
		});
	});


});

describe('ELTree', () => {

	describe('#constructor()', () => {
		it('should have a root node', () => {
			let newTree = new ELTree();
			expect(newTree).to.have.a.property('root');
			expect(newTree.root).to.have.a.property('isRoot', true);
		});
		it('should always have a named value', () => {
			let newTree = new ELTree();
			expect(newTree.root.value).to.be.a('string').and.to.not.equal('');
		});
		it('should have a root node with the name passed in', () => {
			let jill = new ELTree('jill');
			expect(jill.root).to.have.a.property('value', 'jill');
		})
	});

});

describe('ELLogicModel', () => {

	describe('#children()', () => {
		const initValue = 'clyde';
		let clyde = new ELTree('clyde');

		const constructPets = (catsAndDogs = false) => {
			clyde.root.operator = '.';
			let hasNode = new ELNode('has');
			clyde.root.children.push(hasNode);
			hasNode.operator = '.';
			let petNode = new ELNode('pet');
			hasNode.children.push(petNode);

			if (catsAndDogs === true) {
				let catNode = new ELNode('cat');
				let dogNode = new ELNode('dog');
				petNode.children.push(catNode);
				petNode.children.push(dogNode);
			}
		}

		beforeEach(() => {
			clyde = new ELTree(initValue);
			testInit(clyde, initValue);
		});

		it('should return an initial value without children', () => {
			expect(children(clyde, initValue)).to.deep.equal([]);
		});
		it('should handle a linear tree correctly', () => {
			constructPets();
			expect(children(clyde, 'clyde')).to.have.lengthOf(1).and.to.deep.equal(['has']);
			expect(children(clyde, 'clyde.has')).to.have.lengthOf(1).and.to.deep.equal(['pet']);
		});
		it('should handle a branching tree correctly', () => {
			constructPets(true);
			expect(children(clyde, 'clyde.has.pet')).to.have.lengthOf(2)
				.and.to.include.members(['cat', 'dog']);
		});

	});

	describe('#claim()', () => {

		const initValue = 'jill';
		let jill = new ELTree(initValue);

		beforeEach(() => {
			jill = new ELTree(initValue);
			testInit(jill, initValue);
		});

		it('should not mutate the tree when inserting an empty statement', () => {
			claim(jill, '');
			testInit(jill, initValue);
		});

		it('should add a simple statement to the model if not present', () => {
			claim(jill, 'jill.likes.jack');
			expect(jill.root.children).to.have.lengthOf(1);
			expect(children(jill, 'jill')).to.deep.equal(['likes']);
			expect(children(jill, 'jill.likes')).to.have.lengthOf(1);
			expect(children(jill, 'jill.likes')).to.deep.equal(['jack']);
		});

		claimTests.forEach((data) => {
			it('should model \''+data.name+'\'', () => {
				jill = new ELTree(initValue);
				testInit(jill, initValue);

				data.statements.forEach((statement) => { claim(jill, statement); });

				Object.keys(data.result).forEach((key) => {
					const expected = data.result[key];
					expect(children(jill, key)).to.have.lengthOf(expected.length)
						.and.to.include.members(expected);
				});
			});
		});
				
		
	});
});

describe('#satisfies()', () => {
	const initValue = 'toby';
	let toby = new ELTree(initValue);

	const reset = () => {
		toby = new ELTree(initValue);
		testInit(toby, initValue);
	};

	beforeEach(reset);

	it('should only allow is (.), exclusive-is (!), or empty () as operator types', () => {
		let newNode = new ELNode();
		expect(newNode.operator).to.be.a('string').and.to.equal('');
		newNode.operator = '=';
		toby.root.children.push(newNode);
		const invalidSatisfy = () => { satisfies(toby, 'toby.arbitrary.statement'); };
		expect(invalidSatisfy).to.throw();
	});

	it('should not have an operator without a child and vice versa', () => {
		toby.root.children.push(new ELNode());
		const invalidSatisfy = () => { satisfies(toby, 'toby.arbitrary'); };
		expect(invalidSatisfy, 'empty operator with children').to.throw();
		reset();
		expect(toby.root.children).to.have.lengthOf(0);
		toby.root.operator = '.';
		expect(invalidSatisfy, 'valid operator without children').to.throw();
	});

	it('should satisfy a simple statement', () => {
		let moodNode = new ELNode('mood');
		toby.root.operator = '.';
		toby.root.children.push(moodNode);
		moodNode.operator = '.';
		moodNode.children.push(new ELNode('beaming'));
		expect(satisfies(toby, 'toby.mood.beaming')).to.be.true;
	});

	satisfiesTests.forEach((data) => {
		it('should satisfy \''+data.name+'\''), () => {
			data.statements.forEach((statement) => { claim(toby, statement); });
			data.satisfies.forEach((test) => { expect(satisfies(toby, test[0])).to.equal(test[1]); });
		};
	});
	// exclusive operator
});

