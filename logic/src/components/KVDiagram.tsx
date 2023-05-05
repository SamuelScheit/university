import { ReactElement, useMemo, useState } from "react";
import { getAllVariables, evaluate } from "../Evaluator";
import { AST } from "../Parser";
import "./KVDiagram.scss";

export function KVDiagram({ ast }: { ast?: AST }) {
	if (!ast) return null;

	var variables = getAllVariables(ast).sort();

	// console.log(values, variables);

	const vars = generate(variables);

	console.log(vars);

	return (
		<table className="kvdiagram">
			<thead>
				<tr>
					<th style={{ border: "none" }} />
					{vars.top.map((_, i) => {
						var [variable, value] = VariableValue(_);
						return (
							<th
								style={{ borderBottomWidth: value ? 2 : 0 }}
								key={i}
							>
								{value ? variable : ""}
							</th>
						);
					})}
					<th style={{ border: "none" }} />
				</tr>
			</thead>
			<tbody>
				{vars.left.map((_, i) => {
					var [left, leftValue] = VariableValue(vars.left[i]);
					var [right, rightValue] = VariableValue(vars.right[i]);

					return (
						<tr key={i}>
							<th style={{ borderRightWidth: leftValue ? 2 : 0 }}>
								{leftValue ? left : ""}
							</th>
							{vars.top.map((_, j) => {
								var [bottom, bottomValue] = VariableValue(
									vars.bottom[j]
								);
								var [top, topValue] = VariableValue(
									vars.top[j]
								);

								var value = evaluate(ast, {
									[top]: topValue,
									[left]: leftValue,
									[right]: rightValue,
									[bottom]: bottomValue,
								});

								return (
									<td
										key={j}
										className={value ? "active" : ""}
									/>
								);
							})}

							<th style={{ borderLeftWidth: rightValue ? 2 : 0 }}>
								{rightValue ? right : ""}
							</th>
						</tr>
					);
				})}
			</tbody>
			<tfoot>
				<tr>
					<th style={{ border: "none" }} />
					{vars.bottom.map((_, i) => {
						var [variable, value] = VariableValue(_);
						return (
							<th
								style={{ borderTopWidth: value ? 2 : 0 }}
								key={i}
							>
								{value ? variable : ""}
							</th>
						);
					})}
					<th style={{ border: "none" }} />
				</tr>
			</tfoot>
		</table>
	);
}

function VariableValue(variable: string): [string, boolean] {
	if (!variable) return ["", false];
	var value = variable.split("").length == 2 ? false : true;

	return [variable, value];
}

function generate1(variables: string[]) {
	return {
		top: overlineArray(variables.slice(0, 1), true),
		left: [""],
		right: [],
		bottom: [],
	};
}

function generate2(variables: string[]) {
	return {
		...generate1(variables),
		left: overlineArray(variables.slice(1, 2), true),
		right: [],
		bottom: [],
	};
}

function generate3(variables: string[]) {
	var result = generate2(variables);

	return {
		...result,
		top: mirroredArray(result.top),
		bottom: overlineArray(mirroredArray(variables.slice(2, 3))).reverse(),
	};
}

function generate4(variables: string[]) {
	return {
		...generate3(variables),
		left: mirroredArray(overlineArray(variables.slice(1, 2), true)),
		right: overlineArray(mirroredArray(variables.slice(3, 4))).reverse(),
	};
}

function generate(variables: string[]) {
	if (variables.length === 1) return generate1(variables);
	if (variables.length === 2) return generate2(variables);
	if (variables.length === 3) return generate3(variables);
	if (variables.length === 4) return generate4(variables);

	var side = variables.length / 4;
	var top = overlineArray(variables.slice(side, side * 2), true);
	var left = overlineArray(variables.slice(side * 3, side * 4), true);

	var bottom = mirroredArray(variables.slice(0, side));
	var right = duplicateArray(variables.slice(side * 2, side * 3));

	return {
		top: mirroredArray(top),
		bottom: overlineArray(bottom).reverse(),
		right: overlineArray(right).reverse(),
		left: mirroredArray(left),
	};
}

function duplicateArray(arr: string[]) {
	var result = [] as string[];

	for (let i = 0; i < arr.length; i++) {
		result.push(arr[i]);
		result.push(arr[i]);
	}

	return result;
}

function mirroredArray(arr: string[]) {
	var result = [...arr] as string[];

	for (let i = arr.length - 1; i >= 0; i--) {
		result.push(arr[i]);
	}

	return result;
}

function overlineArray(arr: string[], order?: boolean | undefined) {
	var result = [] as string[];

	arr.forEach((x) => {
		if (order === true) {
			result.push(overline(x));
			result.push(x);
		} else if (order === false) {
			result.push(x);
			result.push(overline(x));
		} else {
			result.push(x);
		}
	});

	if (order === undefined) {
		arr.forEach((x) => {
			result.push(overline(x));
		});
	}

	return result;
}

// @ts-ignore
globalThis.generate = generate;

function arraySize(length: number) {
	return [...Array(length).keys()];
}

export function KVRow({ variable }: { variable: string }) {
	return (
		<tr>
			<td>{variable}</td>
			<td>{overline(variable)}</td>
		</tr>
	);
}

export function overline(text: string) {
	return text
		.split("")
		.map((x) => x + "\u0305")
		.join("");
}
