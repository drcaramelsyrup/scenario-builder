import assert from 'assert';

describe('Array', () => {
	describe('#indexOf()', () => {
		it('should return -1 when the value is not present', () => {
			assert.equal(-1, [1,2,3].indexOf(4));
		});
	});
});

describe('ELNode', () => {
	describe('#operatorType', () => {
		it('should have only one operator type per parent node');
	});
});

// describe('ELImprov', () => {

// 	// Test data
// 	const testSnippet = {
// 		'test-snippet': {
// 			groups: [
// 				{
// 					phrases: ['flower', 'tree', 'shrubbery']
// 				}
// 			]
// 		},
// 		'binding-snippet': 
// 	};

// 	describe('#postconditions', () => {
// 		it('should include postconditions in flattened groups', () => {

// 		});
// 		// should merge postconditions into tags
// 		// should not 
// 	});
// 	// should allow non-exclusive tags
// });