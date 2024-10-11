import {
	AST,
	SYMBOL,
	BINARY,
	AND,
	NOT,
	OR,
	IMPLIES,
	IFF,
	XOR,
	UNARY,
	TRUE,
	FALSE,
} from "./Parser";

export function evaluate(
	ast: AST,
	variables: Record<string, boolean>
): boolean {
	switch (ast.type) {
		case BINARY:
			switch (ast.operator) {
				case AND:
					return (
						evaluate(ast.left, variables) &&
						evaluate(ast.right, variables)
					);
				case OR:
					return (
						evaluate(ast.left, variables) ||
						evaluate(ast.right, variables)
					);
				case IMPLIES:
					return (
						!evaluate(ast.left, variables) ||
						evaluate(ast.right, variables)
					);
				case IFF:
					return (
						evaluate(ast.left, variables) ===
						evaluate(ast.right, variables)
					);
				case XOR:
					return (
						evaluate(ast.left, variables) !==
						evaluate(ast.right, variables)
					);
				default:
					return false;
			}
		case UNARY:
			switch (ast.operator) {
				case NOT:
					return !evaluate(ast.right, variables);
				default:
					return false;
			}
		case SYMBOL:
			if (ast.name === TRUE) return true;
			if (ast.name === FALSE) return false;

			return variables[ast.name];
		default:
			return false;
	}
}

export function evaluateAll(ast: AST) {
	var allVariables = getAllVariables(ast).sort();
	// generate truth table
	const rows = 2 ** allVariables.length;
	const values: { variables: Record<string, boolean>; result: boolean }[] =
		[];

	for (let i = 0; i < rows; i++) {
		const variables: Record<string, boolean> = {};
		for (let j = 0; j < allVariables.length; j++) {
			variables[allVariables[j]] = Boolean((i >> j) & 1);
		}
		const result = evaluate(ast, variables);

		values.push({ result, variables });
	}

	allVariables = allVariables.reverse();

	return {
		values,
		variables: allVariables,
	};
}

export function getAllVariables(ast: AST): string[] {
	switch (ast.type) {
		case BINARY:
			return [
				...new Set([
					...getAllVariables(ast.left),
					...getAllVariables(ast.right),
				]),
			];
		case UNARY:
			return getAllVariables(ast.right);
		case SYMBOL:
			if (ast.name === TRUE || ast.name === FALSE) return [];
			return [ast.name];
		default:
			return [];
	}
}

// @ts-ignore
globalThis.evaluateAll = evaluateAll;
