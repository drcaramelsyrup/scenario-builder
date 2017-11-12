/* @flow */
import ELTree from './el-tree';
import type { ModalOperator } from './el-types';
import { retrieve } from './el-utils';

const variableIndices = (...args): Array<Number> => {
	return args.reduce((indices, arg, idx) => {
		if (arg.includes('*'))	// wildcard is our special keyword
			indices.push(idx);
		return indices;
	}, []);
};

const identity = (tree: ELTree, ...variables): mixed => {
	if (variables.length <= 0)
		throw new Error('Identity function received no variables');
	if (variables.length !== 1)
		throw new Error('Identity function expected 1 variable but got '+variables.length);

	const resolved: Array<Array<string | number> | string | number> = resolve(tree, ...variables);
	// Identity should only have one resolution
	if (resolved.length !== 1)
		throw new Error('Identity function expected one variable resolution, got '+resolved.length);
	const resolution = resolved[0];
	if (typeof resolution === 'string' || typeof resolution === 'number')
		return resolution;
	if (resolution.length === 0)
		return undefined;
	return resolution[0];
};

const resolve = (tree: ELTree, ...variables: Array<mixed>) => {
	return variables.map((variable) => resolveVariable(tree, variable));
};

const resolveVariable = (tree: ELTree, variable: mixed): Array<string | number> | string | number => {
	let processed: string = '';
	if (typeof variable === 'number')
		return variable;	// not a variable
	else if (typeof variable === 'string')
		processed = variable;

	// Expect only one wildcard
	const wildcardIndices = processed.split('').reduce((acc: Array<number>, char: string, idx: number) => {
		return char === '*' ? acc.concat(idx) : acc;
	}, []);
	if (wildcardIndices.length <= 0)	// not a variable
		return processed;
	if (wildcardIndices.length > 1)
		throw new Error('Not currently handling more than one wildcard in a variable');

	const operator = processed[wildcardIndices[0] - 1];
	if (operator !== '' && operator !== '!' && operator !== '.')
		throw new Error('Expected a ModalOperator in variable string, got \''+operator);

	const node = retrieve(tree, processed.slice(0, wildcardIndices[0] - 1));
	if (node == null)
		return [];	// could not resolve variable

	if (!opSatisfies(operator, node.operator))
		return [];

	return node.children.map(child => 
		isNaN(child.value) ? child.value : parseInt(child.value));
}

const opSatisfies = (requestedOp: ModalOperator, toSatisfyOp: ModalOperator): boolean => {
	if (requestedOp === toSatisfyOp)
		return true;
	if (requestedOp === '!' && toSatisfyOp === '.')
		return false;
	if (requestedOp === '' || toSatisfyOp === '')
		return false;
	return true;
};

const PreconditionFns : Map<string, (ELTree, ...args: Array<mixed>) => mixed> = new Map(
	[['identity', identity]]
);

export { PreconditionFns };
