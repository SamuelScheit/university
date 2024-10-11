import { useEffect, useState } from "react";

export function Tooltip() {
	const [tooltip, setTooltip] = useState({
		title: "",
		x: 0,
		y: 0,
	});

	useEffect(() => {
		function onMove(e: PointerEvent) {
			if (e.pointerType === "touch") return;
			if (!e.target) return;
			const target = e.target as HTMLElement;
			const title = target.dataset.timezone;
			if (!title) return setTooltip({ title: "", x: 0, y: 0 });
			setTooltip({
				title,
				x: e.clientX - title.length * 4,
				y: e.clientY,
			});
		}

		window.addEventListener("pointermove", onMove);

		return () => {
			window.removeEventListener("pointermove", onMove);
		};
	}, []);

	return (
		<div
			className="tooltip"
			style={{
				left: tooltip.x,
				top: tooltip.y - 30,
				opacity: tooltip.title ? 1 : 0,
			}}
		>
			{tooltip.title}
		</div>
	);
}
