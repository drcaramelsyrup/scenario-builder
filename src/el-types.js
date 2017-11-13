/* @flow */

export type ModalOperator = '.' | '!' | '';
export type Compare = {|
	fn: Array<number | string>,
	cmp: mixed
|}
export type Precondition = string | Compare;

export type Postcondition = string;

