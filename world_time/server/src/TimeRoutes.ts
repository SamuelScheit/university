import { ITimeRoutes } from "../../proto/dist/time.server";
import { TimeRequest, TimeResponse } from "../../proto/dist/time";
import { ServerCallContext } from "@protobuf-ts/runtime-rpc";

export class TimeRoutes implements ITimeRoutes {
	async request(request: TimeRequest, context: ServerCallContext): Promise<TimeResponse> {
		request.timezone;
		const now = new Date();
		// unixOffset calculates the time it took for the request to arrive and sent back
		const unixOffset = (BigInt(now.getTime()) - request.unix) * 2n;
		now.setMilliseconds(0);

		const local = new Date(now.toLocaleString("en-US", { timeZone: request.localTimezone }));
		const timezone = new Date(now.toLocaleString("en-US", { timeZone: request.timezone }));

		return {
			offset: BigInt(local.getTime() - timezone.getTime()),
			unixOffset: unixOffset,
		};
	}
}
