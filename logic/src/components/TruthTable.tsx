import { useMemo, useState } from "react";
import { evaluateAll } from "../Evaluator";
import { AST } from "../Parser";
import "./TruthTable.scss";

export function TruthTable({ ast }: { ast?: AST }) {
	if (!ast) return null;

	const { values, variables } = useMemo(() => evaluateAll(ast), [ast]);

	return (
		<table className="truthtable">
			<thead>
				<tr>
					{variables.map((variable, index) => (
						<th key={index}>{variable}</th>
					))}
					<th className="result">Result</th>
				</tr>
			</thead>
			<tbody>
				{values.map((row, index) => (
					<tr key={index}>
						{variables.map((variable) => (
							<td key={variable}>
								{row.variables[variable] ? "1" : "0"}
							</td>
						))}
						<td className="result">{row.result ? "1" : "0"}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
