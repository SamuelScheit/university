import React, { Component, DOMAttributes, useEffect, useRef } from "react";
import "./App.scss";
import "mathlive";
import { MathfieldElement, MathfieldOptions } from "mathlive";
import { AST, Parser } from "./Parser";
import { ASTNode } from "./Visualizer";
import { transform } from "./Transformer";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"math-field": React.DetailedHTMLProps<any, MathfieldElement>;
		}
	}
}

const parser = new Parser();

// @ts-ignore
globalThis.parser = parser;
// @ts-ignore
globalThis.transform = transform;

export class App extends Component {
	state = {
		ast: null as any,
		error: null as Error | null,
		value: "",
	};
	history!: AST[];
	index!: number;
	iterator!: Generator<AST, AST, undefined> | null;
	focused = false;

	componentDidMount(): void {
		console.log("mounted");

		window.addEventListener("keydown", (e) => {
			if (this.focused) return;

			if (e.code === "Enter" || e.code === "Space" || e.code === "ArrowRight") {
				this.next();
			} else if (e.code === "ArrowLeft") {
				this.previous();
			}
		});
	}

	onChange = (e: any) => {
		try {
			var value = e.target.value
				.replace(/(XOR)/gi, "⊕")
				.replace(/(XNOR)/gi, "⊻")
				.replace(/(NOR)/gi, "⊽")
				.replace(/(NAND)/gi, "⊼")
				.replace(/[⋅*]|(AND)/gi, "∧")
				.replace(/[+]|(OR)/gi, "∨")
				.replace(/(<->)(IFF)/gi, "↔")
				.replace(/(->)|(IMPLIES)/gi, "→")
				.replace(/(TRUE)/gi, "⊤")
				.replace(/(FALSE)/gi, "⊥")
				.replace(/[!]|(NOT)/gi, "¬");

			this.setState({ value });

			const ast = parser.parse(value);
			this.index = -1;
			this.iterator = null;
			this.history = [JSON.parse(JSON.stringify(ast))];
			this.state.ast = ast;
			this.simplify();

			// @ts-ignore
			globalThis.ast = ast;
		} catch (error) {
			this.setState({ error: error as Error, ast: null });
			console.log(error);
		}
	};

	simplify = async () => {
		if (!this.iterator) this.iterator = transform(this.state.ast, this.state.ast);

		let next = this.iterator.next();
		this.history.push(JSON.parse(JSON.stringify(next.value)));

		if (next.done) this.iterator = null;

		console.log(this.index + 1, this.history, next.value);

		this.setState({ ast: this.history[++this.index], error: null });
	};

	next = () => {
		console.log(this.index + 1, "go next");
		if (this.index >= this.history.length - 1) return this.simplify();

		this.setState({ ast: this.history[++this.index] });
	};

	previous = () => {
		if (this.index <= 0) return;
		console.log(this.index - 1, "previous");

		this.setState({ ast: this.history[--this.index] });
	};

	skip = () => {
		if (!this.iterator) this.simplify();

		for (const x of this.iterator!) {
			this.history.push(JSON.parse(JSON.stringify(x)));
		}

		this.iterator = null;
		this.index = this.history.length - 1;
		this.setState({ ast: this.history[this.index] });
	};

	render() {
		return (
			<div className="App">
				<input
					onBlur={() => (this.focused = false)}
					onFocus={() => (this.focused = true)}
					type="text"
					onChange={this.onChange}
					value={this.state.value}
				/>

				<div style={{ display: "flex", gap: "0.2rem" }}>
					<button onClick={this.previous}>&lt;</button>
					<button onClick={this.next}>&gt;</button>
					<button onClick={this.skip}>Skip</button>
				</div>

				<div style={{ marginTop: "1rem", overflow: "scroll" }}>
					{this.state.ast && <ASTNode node={this.state.ast} />}
					{this.state.error && <div>{this.state.error.message}</div>}
				</div>
			</div>
		);
	}
}

export default App;
