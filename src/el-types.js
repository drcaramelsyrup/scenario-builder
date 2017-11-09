/* @flow */

export type ModalOperator = '.' | '!' | '';
export type Precondition = Array<string>;
// Precondition = {
// 	PreconditionType: 'sat' | 'fn',
// 	statement: '',
// 	callback: [args, callbackName],
// 	compare: 0
// }
// callbacks:
// Identity
// GreaterThan
// Equal
// LessThan
// GreaterOrEqual
// LessOrEqual
export type Postcondition = string;
