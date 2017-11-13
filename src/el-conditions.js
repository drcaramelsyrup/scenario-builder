/* @flow */
import ELTree from './el-tree';
import type { ModalOperator } from './el-types';
import { retrieve } from './el-utils';

type Resolution = Array<Array<string | number> | string | number>;

const variableIndices = (...args): Array<Number> => {
	return args.reduce((indices, arg, idx) => {
		if (arg.includes('*'))	// wildcard is our special keyword
			indices.push(idx);
		return indices;
	}, []);
};

const same = (tree: ELTree, ...variables): number => {
	if (variables.length !== 2)
		throw new Error('String compare expected 2 variables but got '+variables.length);

	const resolved: Resolution = resolve(tree, ...variables);
	if (resolved.length !== 2)
		throw new Error('String compare expected 2 resolutions, got '+resolved.length);
	const resolution: Array<string | number> | string | number = resolved[0];
	const cmp = resolved[1];
	if (typeof resolution === 'number' || typeof cmp === 'number')
		throw new Error('String compare, but got a number');
	if (typeof resolution === 'string')
		return resolution === cmp ? 1 : 0;
	return resolution.reduce((result, curr) => {
		return curr === cmp || result;
	}, false) ? 1 : 0;
};

const less = (tree: ELTree, ...variables): number => {
	return numericalCompare((val: number, cmp: number): boolean => {
		return val < cmp;
	}, tree, ...variables);
};

const lessEq = (tree: ELTree, ...variables): number => {
	return numericalCompare((val: number, cmp: number): boolean => {
		return val <= cmp;
	}, tree, ...variables);
};

const equals = (tree: ELTree, ...variables): number => {
	return numericalCompare((val: number, cmp: number): boolean => {
		return val === cmp;
	}, tree, ...variables);
};

const greater = (tree: ELTree, ...variables): number => {
	return numericalCompare((val: number, cmp: number): boolean => {
		return val > cmp;
	}, tree, ...variables);
};

const greaterEq = (tree: ELTree, ...variables): number => {
	return numericalCompare((val: number, cmp: number): boolean => {
		return val >= cmp;
	}, tree, ...variables);
};

const numericalCompare = (fn: (number, number) => boolean, tree: ELTree, ...variables): number => {
	if (variables.length !== 2)
		throw new Error('Numerical compare expected 2 variables but got '+variables.length);

	const resolved: Resolution = resolve(tree, ...variables);
	if (resolved.length !== 2)
		throw new Error('Numerical compare expected 2 resolutions, got '+resolved.length);
	const resolution: Array<string | number> | string | number = resolved[0];
	const cmp = resolved[1];
	if (typeof resolution === 'string' || typeof cmp !== 'number')
		throw new Error('Numerical compare expected a numerical resolution');
	if (typeof resolution === 'number')
		return fn(resolution, cmp) ? 1 : 0;

	return fn(resolution.reduce((result, curr) => {
		return typeof curr === 'number' ? Math.max(result, curr) : result;
	}, -Infinity), cmp) ? 1 : 0;
};

const identity = (tree: ELTree, ...variables): mixed => {
	if (variables.length !== 1)
		throw new Error('Identity function expected 1 variable but got '+variables.length);

	const resolved: Resolution = resolve(tree, ...variables);
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

const resolve = (tree: ELTree, ...variables: Array<mixed>): Resolution => {
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
	[
		['identity', identity],
		['greater', greater], ['greaterEq', greaterEq],
		['less', less], ['lessEq', lessEq],
		['equals', equals],
		['same', same]
	]
);

export { PreconditionFns };
