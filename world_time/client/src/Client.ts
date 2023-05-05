import { TimeRoutesClient } from "../../proto/src/time.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

export const transport = new GrpcWebFetchTransport({
	baseUrl: "http://localhost:8080",
	format: "binary",
});

export const client = new TimeRoutesClient(transport);
