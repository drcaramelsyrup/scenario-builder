/* @flow */

export type ModalOperator = '.' | '!' | '';
export type Compare = {|
	fn: Array<number | string>,
	cmp: mixed
|}
export type Precondition = string | Compare;

// callbacks:
// Identity
// GreaterThan
// Equal
// LessThan
// GreaterOrEqual
// LessOrEqual
export type Postcondition = string;

