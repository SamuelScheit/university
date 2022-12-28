import "missing-native-js-functions";
import { AST, TRUE, FALSE, AND, OR, NOT, IMPLIES, IFF, XOR, SYMBOL, BINARY, UNARY, TrueSymbol, FalseSymbol } from "./Parser";
import {
	isTrue,
	isFalse,
	isLeftNegatedLeft,
	isDistributive,
	applyDistributive,
	isLeftRepetition,
	isEqual,
	deleteActive,
	markActive,
} from "./TransformerHelper";

function* transformOR(left: AST, right: AST) {
	// A ∨ A = A (idempotence)
	if (isEqual(left, right)) return left;

	// A ∨ true = true (dominance)
	if (isTrue(left) || isTrue(right)) return TrueSymbol;

	// A ∨ false = A (identity)
	if (isFalse(left)) return right;
	if (isFalse(right)) return left;

	// A ∨ ¬A = true (trivial tautology)
	if (isLeftNegatedLeft(left, right) || isLeftNegatedLeft(right, left)) return TrueSymbol;

	// A ∨ (A ∨ ?) = A
	if (isLeftRepetition(left, right, OR)) return left;
	if (isLeftRepetition(right, left, OR)) return right;

	// A ∨ (B ∧ C) = (A ∨ B) ∧ (A ∨ C)
	if (isDistributive(left, right, AND)) return applyDistributive(right, left, OR);
	if (isDistributive(right, left, AND)) return applyDistributive(left, right, OR);
}

function* transformAND(left: AST, right: AST) {
	// A ∧ A = A (idempotence)
	if (isEqual(left, right)) return left;

	// A ∧ false = false (dominance)
	if (isFalse(left) || isFalse(right)) return FalseSymbol;

	// A ∧ true = A (identity)
	if (isTrue(left)) return right;
	if (isTrue(right)) return left;

	// A ∧ (A ∧ ?) = A ∧ ?
	if (isLeftRepetition(left, right, AND)) return right;
	if (isLeftRepetition(right, left, AND)) return left;

	// A ∧ ¬A = false (trivial contradiction)
	if (isLeftNegatedLeft(left, right) || isLeftNegatedLeft(right, left)) return FalseSymbol;

	// A ∧ (B ∨ C) = (A ∧ B) ∨ (A ∧ C)
	if (isDistributive(left, right, OR)) return applyDistributive(right, left, AND);
	if (isDistributive(right, left, OR)) return applyDistributive(left, right, AND);
}

function* transformIMPLIES(left: AST, right: AST) {
	// false → A = true
	if (isFalse(left)) return TrueSymbol;

	// A → true = true
	if (isTrue(right)) return TrueSymbol;

	// A → false = ¬A
	if (isFalse(right)) return { type: UNARY, operator: NOT, right: left } as AST;

	// A → A = true
	if (isEqual(left, right)) return TrueSymbol;

	// A → ¬A = ¬A
	if (isLeftNegatedLeft(left, right)) return { type: UNARY, operator: NOT, right: left } as AST;

	// ¬A → A = A
	if (isLeftNegatedLeft(right, left)) return right;

	// A → G = ¬F ∨ G
	return {
		type: BINARY,
		operator: OR,
		left: {
			type: UNARY,
			operator: NOT,
			right: left,
		},
		right,
	} as AST;
}

function* transformIFF(left: AST, right: AST) {
	// A ↔ A = true
	if (isEqual(left, right)) return TrueSymbol;

	// A ↔ ¬A = false
	if (isLeftNegatedLeft(left, right) || isLeftNegatedLeft(right, left)) return FalseSymbol;

	// false ↔ A = ¬A
	if (isFalse(left)) return { type: UNARY, operator: NOT, right } as AST;
	if (isFalse(right)) return { type: UNARY, operator: NOT, right: left } as AST;

	// true ↔ A = A
	if (isTrue(left)) return right;
	if (isTrue(right)) return left;

	return {
		type: UNARY,
		operator: NOT,
		right: {
			type: BINARY,
			operator: XOR,
			left,
			right,
		},
	} as AST;
}

function* transformXOR(left: AST, right: AST) {
	// A ⊕ A = false
	if (isEqual(left, right)) return FalseSymbol;
	if (isFalse(left)) {
		// false ⊕ true = true
		if (isTrue(right)) return TrueSymbol;
		// false ⊕ A = A
		return right;
	} else if (isFalse(right)) {
		// true ⊕ false = true
		if (isTrue(right)) return TrueSymbol;

		// A ⊕ false = A
		return left;
	}

	// A ⊕ B = ((A ∧ ¬B) ∨ (¬A ∧ B))
	return {
		type: BINARY,
		operator: OR,
		left: {
			type: BINARY,
			operator: AND,
			left: {
				type: UNARY,
				operator: NOT,
				active: true,
				right: left,
			},
			right: right,
		},
		right: {
			type: BINARY,
			operator: AND,
			left: left,
			right: {
				type: UNARY,
				operator: NOT,
				active: true,
				right: { ...right },
			},
		},
	} as AST;
}

function* transformNOT(right: AST) {
	if (right.type === UNARY) {
		if (right.operator === NOT) {
			// ¬¬A = A (double negation)
			return right.right;
		}
	} else if (right.type === BINARY) {
		// ¬(A ∧ B) → ¬A ∨ ¬B (deMorgan)
		// ¬(A ∨ B) → ¬A ∧ ¬B (deMorgan)
		if (right.operator === AND) {
			return {
				type: BINARY,
				operator: OR,
				left: { type: UNARY, operator: NOT, right: right.left },
				right: { type: UNARY, operator: NOT, right: right.right },
			} as AST;
		} else if (right.operator === OR) {
			return {
				type: BINARY,
				operator: AND,
				left: { type: UNARY, operator: NOT, right: right.left },
				right: { type: UNARY, operator: NOT, right: right.right },
			} as AST;
		}
	} else if (right.type === SYMBOL) {
		if (right.name === TRUE) {
			// ¬true = false
			return FalseSymbol;
		} else if (right.name === FALSE) {
			// ¬false = true
			return TrueSymbol;
		}
	}
}

export function* transform(ast: AST, root: AST = undefined as unknown as AST): Generator<AST, AST, undefined> {
	if (!root) root = ast;
	const newRoot = root === ast ? undefined : root;
	let result: AST | undefined;

	switch (ast.type) {
		case BINARY:
			var { operator } = ast;

			var left = yield* transform(ast.left, root);
			if (left.active !== false) {
				markActive(ast.left);
				console.log("yield left active root");
				yield root;

				ast.left = left;
				yield root;
			}
			ast.left = left;
			deleteActive(ast.left);

			var right = yield* transform(ast.right, root);
			if (right.active !== false) {
				markActive(ast.right);
				console.log("yield right active root");
				yield root;

				ast.right = right;
				yield root;
			}
			ast.right = right;
			deleteActive(ast.right);

			if (operator === AND) result = yield* transformAND(left, right);
			else if (operator === OR) result = yield* transformOR(left, right);
			else if (operator === IMPLIES) result = yield* transformIMPLIES(left, right);
			else if (operator === IFF) result = yield* transformIFF(left, right);
			else if (operator === XOR) result = yield* transformXOR(left, right);

			break;
		case UNARY:
			var { operator } = ast;
			var right = yield* transform(ast.right, root);

			if (right.active !== false) {
				markActive(ast.right);
				console.log("yield unary root");
				yield root;

				ast.right = right;
				yield root;
			}

			if (operator === NOT) result = yield* transformNOT(right);

			break;
		case SYMBOL:
			break;
	}

	if (result) {
		if (root === ast) {
			console.log("root === ast");
			markActive(ast);
			yield ast;
			// deleteActive(result);
		}
		// const r = yield* transform(result, newRoot);
		console.log("new result", ast, result, root === ast);
		result.active = true;
		return result;
	}

	return { ...ast, active: false };
}
