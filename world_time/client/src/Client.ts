import { TimeRoutesClient } from "../../proto/src/time.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

export const transport = new GrpcWebFetchTransport({
	// @ts-ignore
	baseUrl: import.meta.env.VITE_ENDPOINT,
	format: "binary",
});

export const client = new TimeRoutesClient(transport);
