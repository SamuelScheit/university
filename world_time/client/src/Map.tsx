import { useLayoutEffect } from "react";
import timezones from "./assets/timezones.json";
import { localTimezone } from "./App";

export function Map({
	onTimezone,
	...props
}: React.SVGProps<SVGSVGElement> & {
	onTimezone: (timezone: any) => void;
}) {
	var polygon = [];

	for (const timezone of timezones) {
		polygon.push(
			<polygon
				key={timezone.timezone + timezone.points}
				onClick={onTimezone.bind(null, timezone)}
				data-timezone={timezone.timezone}
				data-country={timezone.country}
				data-pin={timezone.pin}
				data-offset={timezone.offset}
				points={timezone.points}
				data-zonename={timezone.zonename}
			/>
		);
	}

	useLayoutEffect(() => {
		// @ts-ignore
		document.querySelector(`[data-timezone="${localTimezone}"]`)?.scrollIntoViewIfNeeded?.(true);
	}, []);

	return (
		<div className="world-wrapper">
			<svg {...props} className="world" viewBox="0 0 500 500">
				{polygon}
			</svg>
		</div>
	);
}
