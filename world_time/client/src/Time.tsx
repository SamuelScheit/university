import { useEffect, useState } from "react";

function getLocale() {
	return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
}

export function Time(props: { offset: bigint; unixOffset: bigint }) {
	const date = new Date(Date.now() + Number(props.unixOffset) - Number(props.offset));
	const dateString = date.toLocaleDateString(getLocale());
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	const forceUpdate = useState(0)[1];

	useEffect(() => {
		const interval = setInterval(() => {
			forceUpdate((x) => x + 1);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<div style={{ textAlign: "center" }}>
			<div style={{ fontSize: 30, fontWeight: 500 }}>
				{hours}:{minutes}:{seconds}
			</div>
			<div style={{ color: "#626262", fontSize: 20 }}>{dateString}</div>
		</div>
	);
}
