import React, { Component, DOMAttributes, useEffect, useRef } from "react";
import "./App.scss";
import "mathlive";
import { MathfieldElement, MathfieldOptions } from "mathlive";
import { Parser } from "./Parser";
import { ASTNode } from "./Visualizer";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"math-field": React.DetailedHTMLProps<any, MathfieldElement>;
		}
	}
}

const parser = new Parser();

export class App extends Component {
	ref = React.createRef<MathfieldElement>();
	state = {
		ast: null,
		error: null as Error | null,
	};

	componentDidMount(): void {
		const x = this.ref.current;
		if (!x) return;

		// @ts-ignore
		globalThis.test = this.ref.current;

		x.addEventListener("change", this.onChange);
		this.onChange(null);
	}

	onChange = (e: any) => {
		try {
			const result = this.ref.current?.getValue("ascii-math");
			if (!result) return;
			console.log(result);

			const ast = parser.parse(result);
			this.setState({ ast, error: null });
			console.log(ast);
		} catch (error) {
			this.setState({ error: error as Error, ast: null });
			console.log(error);
		}
	};

	render() {
		return (
			<div className="App">
				<math-field
					default-mode="math"
					ref={this.ref}
					virtual-keyboard-mode="manual"
					children={`((x ∧ y) ∨ z) ∧ ¬(w ∨ x) ∨ x ∨ y`}
					onChange={console.log}
				/>
				<div style={{ marginTop: "1rem", overflowX: "scroll" }}>
					{this.state.ast && <ASTNode node={this.state.ast} />}
					{this.state.error && <div>{this.state.error.message}</div>}
				</div>
			</div>
		);
	}
}

export default App;
