import React, { ReactNode } from "react";
import { AST } from "./Parser";
import "./Visualizer.scss";

interface ASTNodeProps {
	node: AST;
}

export const ASTNode: React.FC<ASTNodeProps> = ({ node }) => {
	let children: ReactNode[];
	let content: ReactNode;
	if (node.type === "BinaryExpression") {
		children = [<ASTNode key="left" node={node.left} />, <ASTNode key="right" node={node.right} />];
		content = node.operator;
	} else if (node.type === "UnaryExpression") {
		children = [<ASTNode key="right" node={node.right} />];
		content = node.operator;
	} else if (node.type === "Symbol") {
		children = [];
		content = node.name;
	} else {
		children = [];
		// @ts-ignore
		content = node?.type;
	}

	return (
		<div className="ast-node">
			<div className="content">{content}</div>
			{children.length > 0 && <div className="children">{children}</div>}
		</div>
	);
};
