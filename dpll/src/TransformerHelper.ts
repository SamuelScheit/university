import { AST, SYMBOL, BINARY, UNARY, NOT, AND, OR, BinaryExpression, FALSE, TRUE } from "./Parser";

export function isFalse(left: AST) {
	return left.type === SYMBOL && left.name === FALSE;
}

export function isTrue(left: AST) {
	return left.type === SYMBOL && left.name === TRUE;
}

export function deleteActive(ast: AST) {
	delete ast.active;
	if (ast.type === BINARY) {
		deleteActive(ast.left);
		deleteActive(ast.right);
	} else if (ast.type === UNARY) {
		deleteActive(ast.right);
	}
}

export function markActive(ast: AST) {
	ast.active = true;
	if (ast.type === BINARY) {
		ast.left.active = true;
		ast.right.active = true;
	} else if (ast.type === UNARY) {
		ast.right.active = true;
	}

	return ast;
}

export function markRecursiveActive(ast: AST) {
	ast.active = true;
	if (ast.type === BINARY) {
		markRecursiveActive(ast.left);
		markRecursiveActive(ast.right);
	} else if (ast.type === UNARY) {
		markRecursiveActive(ast.right);
	}

	return ast;
}

export function isEqual(left: AST, right: AST): boolean {
	if (left.type != right.type) return false;
	if (left.type === SYMBOL && right.type === SYMBOL) return left.name === right.name;
	if (left.type === BINARY && right.type === BINARY)
		return left.operator === right.operator && isEqual(left.left, right.left) && isEqual(left.right, right.right);
	if (left.type === UNARY && right.type === UNARY) return left.operator === right.operator && isEqual(left.right, right.right);

	return false;
}

export function isLeftNegatedLeft(left: AST, right: AST) {
	// A ? ¬A
	return (
		left.type === SYMBOL &&
		right.type === UNARY &&
		right.operator === NOT &&
		right.right.type === SYMBOL &&
		right.right.name === left.name &&
		markActive(right)
	);
}

export function isAbsorption(left: AST, right: AST, operator: typeof AND | typeof OR) {
	// A ? (A operator ?)
	return (
		left.type === SYMBOL &&
		right.type === BINARY &&
		right.operator === operator &&
		(isEqual(right.left, left) || isEqual(right.right, left)) &&
		markActive(right)
	);
}

export function isDistributive(left: AST, right: AST, operator: typeof AND | typeof OR) {
	return (
		left.type !== BINARY && right.type === BINARY && right.operator === operator
		// right.right.type === "Symbol"
		// right.left.type === "Symbol"
	);
}

export function applyDistributive(left: AST, right: AST, operator: typeof AND | typeof OR): AST {
	markRecursiveActive(left);
	markRecursiveActive(right);

	return {
		type: BINARY,
		operator: operator === AND ? OR : AND,
		active: true,
		left: {
			type: BINARY,
			operator: operator,
			active: true,
			left: (left as BinaryExpression).left,
			right: { ...right },
		},
		right: {
			type: BINARY,
			operator: operator,
			active: true,
			left: (left as BinaryExpression).right,
			right: right,
		},
	};
}
