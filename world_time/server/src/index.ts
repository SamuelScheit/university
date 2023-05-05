import * as grpc from "@grpc/grpc-js";
import { adaptService } from "@protobuf-ts/grpc-backend";
import { TimeRoutes as TimeRoutesService } from "../../proto/dist/time";
import { TimeRoutes } from "./TimeRoutes";
import { startGRPCWebProxy } from "./grpcwebproxy";

const server = new grpc.Server();
server.addService(...adaptService(TimeRoutesService, new TimeRoutes()));
server.bindAsync("0.0.0.0:9090", grpc.ServerCredentials.createInsecure(), (err: Error | null, port: number) => {
	if (err) {
		console.error(`Server error: ${err.message}`);
	} else {
		console.log(`Server bound on port: ${port}`);
		server.start();
		startGRPCWebProxy();
	}
});
