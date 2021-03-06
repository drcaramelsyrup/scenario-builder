import { expect } from 'chai';
import ELNode from '../lib/el-node';
import ELTree from '../lib/el-tree';
import Practice from '../lib/practice';
import { claim, children, satisfies, practice, substitute } from '../lib/el-logic';
import { claimTests, satisfiesTests } from './test-data';
import { createPractices } from '../lib/generate';


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

		it('should model simple exclusive statements', () => {
			claim(jill, 'jill.likes.jack');
			claim(jill, 'jill.likes.clyde');
			expect(children(jill, 'jill.likes')).to.include.members(['jack', 'clyde']);
			claim(jill, 'jill.likes!lee');
			expect(children(jill, 'jill.likes')).to.deep.equal(['lee']);
		});
	});


	describe('#satisfies()', () => {
		const initValue = 'toby';
		let toby = new ELTree(initValue);

		const reset = () => {
			toby = new ELTree(initValue);
			testInit(toby, initValue);
		};

		const constructMood = (moodNode) => {
			let initialNode = new ELNode('mood');
			toby.root.operator = '.';
			toby.root.children.push(initialNode);
			initialNode.operator = '.';
			initialNode.children.push(moodNode);
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
			const moodNode = new ELNode('beaming');
			constructMood(moodNode);
			expect(satisfies(toby, 'toby.mood.beaming')).to.be.true;
		});

		satisfiesTests.forEach((data) => {
			reset();
			it('should satisfy \''+data.name+'\'', () => {
				data.statements.forEach((statement) => { claim(toby, statement); });
				data.satisfies.forEach((test) => { expect(satisfies(toby, test[0])).to.equal(test[1]); });
			});
		});

		it('should handle a simple exclusive operator statement', () => {
			const moodNode = new ELNode('cheerful');
			constructMood(moodNode);
			expect(satisfies(toby, 'toby.mood.cheerful')).to.be.true;
			expect(moodNode).to.have.a.property('operator', '');
			moodNode.operator = '!';
			moodNode.children.push(new ELNode('40'));
			expect(satisfies(toby, 'toby.mood.cheerful!40'), 'exclusive is true').to.be.true;
			expect(satisfies(toby, 'toby.mood.cheerful.40'), 'inclusive is true').to.be.true;
			moodNode.children.push(new ELNode('30'));
			expect(() => { satisfies(toby, 'toby.mood.cheerful!arbitrary'); }).to.throw();
		});

		it('should not satisfy exclusive statements on non-exclusive models', () => {
			const moodNode = new ELNode('confused');
			constructMood(moodNode);
			expect(satisfies(toby, 'toby.mood.confused')).to.be.true;
			moodNode.operator = '.';
			moodNode.children.push(new ELNode('befuddled'));
			moodNode.children.push(new ELNode('angry'));
			expect(satisfies(toby, 'toby.mood.confused!befuddled'), 'only befuddled').to.be.false;
			expect(satisfies(toby, 'toby.mood.confused!angry'), 'only angry').to.be.false;
			moodNode.children.unshift();
			expect(satisfies(toby, 'toby.mood.confused!angry'), 'only angry, even with one child').to.be.false;
		});

	});

});

describe('Generation', () => {

	let maria = new ELTree('maria');
	const ate = new Practice('ate', // function name
		['A', 'X', 'Y'], // args
		['A'], // preconditions
		['A.ate.X!Y']	// postconditions
	);
	const tooManyWildcards = new Practice('invalid',
		['A', 'X'],
		[{ fn: ['identity', 'A.*.*'], cmp: 0}],
		['A.ate.X']
	);
	const levelUpFromOne = new Practice('levelUpFromOne',
		['A', 'Y'],
		[{ fn: ['identity', 'A.level!*'], cmp: 1 }],
		['A.level!Y']
	);
	const ride = new Practice('ride',
		['A', 'R'],
		[{ fn: ['greater', 'A.height!*', 30], cmp: 1 }],
		['A.rode.R']
	);
	const quincenera = new Practice('quincenera',
		['A'],
		[{ fn: ['equals', 'A.age!*', 15], cmp: 1 },
		 { fn: ['same', 'A.status.*', 'adult'], cmp: 0 }],
		['A.celebrated', 'A.status.adult']
	);
	const rideGreaterEquals = new Practice('ride',
		['A', 'R'],
		[{ fn: ['greaterEq', 'A.height!*', 30], cmp: 1 }],
		['A.rode.R']
	);
	const kiddie = new Practice('rideKiddieSwing',
		['A', 'R'],
		[{ fn: ['less', 'A.age!*', 18], cmp: 1 },
		 { fn: ['lessEq', 'A.height!*', 20], cmp: 1 }],
		['A.swungOn.R']
	);

	beforeEach(() => {
		maria = new ELTree('maria');
	});

	describe('#practice()', () => {
		it('should replace variable arguments correctly', () => {
			const newArgs = ['maria', 'pudding', 'spoon'];
			expect(substitute(ate, ate.postconditions[0], newArgs)).to.equal('maria.ate.pudding!spoon');
		});

		it('should throw an error if not given enough arguments', () => {
			const newArgs = ['maria', 'pudding'];
			const invalidArgs = () => { substitute(ate, ate.postconditions[0], newArgs); };
			expect(invalidArgs).to.throw();
		});

		it('should handle a simple practice with pre and post conditions', () => {
			practice(maria, ate, 'maria', 'pudding', 'spoon');
			expect(satisfies(maria, 'maria.ate.pudding!spoon')).to.be.true;
		});

		it('should throw an error with invalid practices and conditions', () => {
			expect(() => {
				practice(maria, tooManyWildcards, 'maria', 'pudding');
			}).to.throw();
		});

		it('should handle a practice with an identity precondition', () => {
			claim(maria, 'maria.level!1');
			practice(maria, levelUpFromOne, 'maria', '2');
			expect(satisfies(maria, 'maria.level!2'), 'satisfies preconditions').to.be.true;
			expect(practice(maria, levelUpFromOne, 'maria', '3'), 'does not satisfy precondition').to.be.false;
			expect(satisfies(maria, 'maria.level!3'), 'did not execute failed practice').to.be.false;
		});

		it('should handle a practice with a greater than precondition', () => {
			claim(maria, 'maria.height!20');
			practice(maria, ride, 'maria', 'hydroblaster');
			expect(satisfies(maria, 'maria.rode.hydroblaster'), 'does not satisfy').to.be.false;
			claim(maria, 'maria.height!40');
			practice(maria, ride, 'maria', 'hydroblaster');
			expect(satisfies(maria, 'maria.rode.hydroblaster'), 'satisfies height').to.be.true;
		});

		it('should handle a practice with an equals and same precondition', () => {
			claim(maria, 'maria.age!14');
			practice(maria, quincenera, 'maria');
			expect(satisfies(maria, 'maria.celebrated')).to.be.false;
			claim(maria, 'maria.age!15');
			practice(maria, quincenera, 'maria');
			expect(satisfies(maria, 'maria.celebrated')).to.be.true;
			expect(practice(maria, quincenera, 'maria')).to.be.false;
		});

		it('should handle a practice with greater than or equals precondition', () => {
			claim(maria, 'maria.height!29');
			practice(maria, rideGreaterEquals, 'maria', 'thundermountain');
			expect(satisfies(maria, 'maria.rode.thundermountain')).to.be.false;
			claim(maria, 'maria.height!30');
			practice(maria, rideGreaterEquals, 'maria', 'thundermountain');
			expect(satisfies(maria, 'maria.rode.thundermountain')).to.be.true;
		});
		
		it('should handle a practice with a less than (or equal) precondition', () => {
			claim(maria, 'maria.age!20');
			claim(maria, 'maria.height!20');
			practice(maria, kiddie, 'maria', 'chocomonster');
			expect(satisfies(maria, 'maria.swungOn.chocomonster')).to.be.false;
			claim(maria, 'maria.age!16');
			practice(maria, kiddie, 'maria', 'chocomonster');
			expect(satisfies(maria, 'maria.swungOn.chocomonster')).to.be.true;
		});

	});

	describe('#parse()', () => {
		const practices = createPractices('test/test-corpus.yaml');
		expect(practices).to.have.own.property('relationships');
		expect(practices).to.have.own.property('fate');
		expect(practices).to.have.own.property('engine');
		expect(practices['fate']).to.deep.include(
			new Practice(
				'theft',
				['$X', '$A', '$B'],
				[{ fn: ['greaterEq', '$X.money.*', '$A'], cmp: 1 }],
				['$X.money.$B'],
				'Someone has robbed $X of their money!'
			)
		);
	});

	describe('#generate()', () => {
		const practices = createPractices('test/test-corpus.yaml');
	});

});


