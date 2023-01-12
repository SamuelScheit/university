import React, { Component } from "react";
import "./App.scss";
import "mathlive";
import { AND, AST, FALSE, IFF, IMPLIES, NOT, OR, Parser, TRUE } from "../Parser";
import { ASTNode } from "./Node";
import { transform } from "../Transformer";
import "../Evaluator";
import { TruthTable } from "./TruthTable";
import { KVDiagram } from "./KVDiagram";

const parser = new Parser();

// @ts-ignore
globalThis.parser = parser;
// @ts-ignore
globalThis.transform = transform;

export class App extends Component {
	state = {
		ast: null as any,
		error: null as Error | null,
		value: "(((¬q∧¬t)∨(p∨t))∨(q∧((¬t∨p)∧(¬p∨t))))∨(((q∨t)∧(¬p∧¬t))∧(¬q∨((t∧¬p)∨(p∧¬t))))",
	};
	history!: AST[];
	index!: number;
	iterator!: Generator<AST, AST, undefined> | null;
	focused = false;

	componentDidMount(): void {
		window.addEventListener("keydown", (e) => {
			if (this.focused) return;

			if (e.code === "Enter" || e.code === "Space" || e.code === "ArrowRight") {
				this.next();
			} else if (e.code === "ArrowLeft") {
				this.previous();
			}
		});
		this.onChange({ target: { value: this.state.value } } as any);
	}

	onChange = (e: any) => {
		try {
			var value = e.target.value
				.replace(/(XOR)/gi, "⊕")
				.replace(/(XNOR)/gi, "⊻")
				.replace(/(NOR)/gi, "⊽")
				.replace(/(NAND)/gi, "⊼")
				.replace(/[⋅*]|(AND)/gi, AND)
				.replace(/[+]|(OR)/gi, OR)
				.replace(/(<->)(IFF)/gi, IFF)
				.replace(/(->)|(IMPLIES)/gi, IMPLIES)
				.replace(/(TRUE)/gi, TRUE)
				.replace(/(FALSE)/gi, FALSE)
				.replace(/[!]|(NOT)/gi, NOT);

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

		this.setState({ ast: this.history[++this.index], error: null });
	};

	next = () => {
		if (this.index >= this.history.length - 1) return this.simplify();

		this.setState({ ast: this.history[++this.index] });
	};

	previous = () => {
		if (this.index <= 0) return;

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
				<div className="container">
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
				</div>
				<div style={{ marginTop: "1rem", overflow: "scroll", marginBottom: "3rem" }}>
					{this.state.ast && <ASTNode node={this.state.ast} />}
					{this.state.error && <div>{this.state.error.message}</div>}
				</div>
				<div className="container">
					<KVDiagram ast={this.state.ast} />
				</div>
				<div className="container">
					<TruthTable ast={this.state.ast} />
				</div>
			</div>
		);
	}
}

export default App;
