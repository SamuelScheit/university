export type AST = BinaryExpression | UnaryExpression | Symbol;

export interface BinaryExpression {
	type: typeof BINARY;
	operator: string;
	left: AST;
	right: AST;
	active?: boolean;
}

export interface UnaryExpression {
	type: typeof UNARY;
	operator: string;
	right: AST;
	active?: boolean;
}

export interface Symbol {
	type: typeof SYMBOL;
	name: string;
	active?: boolean;
}

export const TRUE = "⊤";
export const FALSE = "⊥";
export const AND = "∧";
export const OR = "∨";
export const NOT = "¬";
export const IMPLIES = "→";
export const IFF = "↔";
export const XOR = "⊕";
export const SYMBOL = "Symbol";
export const BINARY = "BinaryExpression";
export const UNARY = "UnaryExpression";

export const TrueSymbol = { type: SYMBOL, name: TRUE, active: true } as Symbol;
export const FalseSymbol = { type: SYMBOL, name: FALSE, active: true } as Symbol;

export class Parser {
	input!: string;
	pos!: number;
	operators = [
		{ name: NOT, precedence: 0, kind: "unary" },
		{ name: AND, precedence: 1, kind: "binary" },
		{ name: OR, precedence: 1, kind: "binary" },
		{ name: IMPLIES, precedence: 1, kind: "binary" },
		{ name: IFF, precedence: 1, kind: "binary" },
		{ name: XOR, precedence: 1, kind: "binary" },
	];

	parse(input: string): AST {
		this.input = input;
		this.pos = 0;
		// Parse the input string and return the resulting AST
		const expression = this.parseExpression();
		if (this.pos < this.input.length) {
			throw new Error(`Unexpected character at position ${this.pos}`);
		}
		return expression;
	}

	parseExpression(precedence: number = 0): AST {
		// Parse a single expression and return the resulting AST
		let expression = this.parseTerm();
		while (this.pos < this.input.length) {
			const operator = this.parseOperator();
			if (!operator) break;
			if (operator.precedence < precedence) break;
			const right = this.parseTerm();
			expression = { type: "BinaryExpression", operator: operator.name, left: expression, right };
		}
		return expression;
	}

	parseTerm(): AST {
		// Parse a term (symbol or unary expression) and return the resulting AST
		this.skipWhitespace();
		const nextChar = this.input[this.pos];
		const operator = this.parseOperator();
		if (operator) {
			return { type: "UnaryExpression", operator: operator.name, right: this.parseTerm() };
		} else if (nextChar === "(") {
			this.pos++; // skip the "(" character
			const expression = this.parseExpression();
			this.skipWhitespace();
			if (this.input[this.pos] !== ")") {
				throw new Error(`Expected ")" at position ${this.pos}`);
			}
			this.pos++; // skip the ")" character
			return expression;
		} else {
			return this.parseSymbol();
		}
	}

	parseSymbol(): Symbol {
		// Parse a symbol and return the resulting Symbol AST node
		this.skipWhitespace();
		let symbol = "";
		while (this.pos < this.input.length) {
			const nextChar = this.input[this.pos];
			if (!/[a-zA-Z0-9⊤⊥$]/.test(nextChar)) {
				// allow any alphanumeric characters as symbol characters
				break;
			}
			symbol += nextChar;
			this.pos++;
		}
		if (!symbol) {
			throw new Error(`Expected symbol at position ${this.pos}`);
		}

		return { type: "Symbol", name: symbol }; // allow any symbol name
	}

	skipWhitespace(): void {
		// Skip any whitespace characters at the current position
		while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
			this.pos++;
		}
	}

	parseOperator() {
		// Parse an operator and return it as a string
		this.skipWhitespace();
		const nextChar = this.input[this.pos];
		const operator = this.operators.find((x) => x.name === nextChar);
		if (!operator) return;

		this.pos++;
		return operator;
	}
}
