import "missing-native-js-functions";
import { useEffect, useState } from "react";
import { Tooltip } from "./Tooltip";
import { Map } from "./Map";
import timezones from "./assets/timezones.json";
import { client } from "./Client";
import { Time } from "./Time";
import { getFlagEmoji } from "./Util";

export const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";

export function App() {
	const [time, setTime] = useState({
		unixOffset: 0n,
		offset: 0n,
		timezone: localTimezone,
		error: null as any,
	});

	useEffect(() => {
		const unix = BigInt(Date.now());
		client
			.request({ timezone: time.timezone, localTimezone, unix })
			.then(({ response }) => {
				setTime({ ...time, ...response, error: null });
			})
			.catch((error) => {
				setTime({ ...time, error: error.toString() });
			});

		document.querySelectorAll(`polygon`).forEach((x: any) => {
			x.style.fill = "";
		});
		document.querySelectorAll(`[data-timezone="${time.timezone}"]`).forEach((x: any) => {
			x.style.fill = "#007bff";
		});
	}, [time.timezone]);

	function updateTimezone(timezone: string) {
		setTime({ ...time, timezone });
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: 10,
			}}
		>
			<h1 style={{ textAlign: "center" }}>World Time</h1>
			<Time {...time} />
			<select
				style={{ marginTop: 10 }}
				value={time.timezone}
				onChange={(e: any) => {
					updateTimezone(e.target.value);
				}}
			>
				{timezones
					.map((x) => x.timezone)
					.unique()
					.map((timezone) => (
						<option key={timezone} value={timezone}>
							{getFlagEmoji(timezones.find((x) => x.timezone === timezone)?.country)} {timezone}
						</option>
					))}
			</select>

			{time.error && (
				<div style={{ marginTop: 20, color: "red", fontSize: 20, textAlign: "center" }}>
					There was an error requesting the time from the server.
					<br />
					<span style={{ fontSize: 16 }}>{time.error}</span>
				</div>
			)}
			<Tooltip />
			<Map
				onTimezone={({ timezone }) => {
					updateTimezone(timezone);
					console.log(timezone);
				}}
			/>
		</div>
	);
}
