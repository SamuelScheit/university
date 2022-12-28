import { useMemo, useState } from "react";
import { evaluateAll } from "../Evalutator";
import { AST } from "../Parser";
import "./TruthTable.scss";

export function TruthTable({ ast }: { ast?: AST }) {
	if (!ast) return null;

	const { values, variables } = useMemo(() => evaluateAll(ast), [ast]);

	return (
		<table>
			<thead>
				<tr>
					{variables.map((variable, index) => (
						<th key={index}>{variable}</th>
					))}
					<th>Result</th>
				</tr>
			</thead>
			<tbody>
				{values.map((row, index) => (
					<tr key={index}>
						{Object.entries(row.variables).map(([key, value]) => (
							<td key={index}>{value ? "True" : "False"}</td>
						))}
						<td>{row.result ? "True" : "False"}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
