import { exec } from "child_process";
import path from "path";

const file = {
	darwin: "grpcwebproxy_mac",
	win32: "grpcwebproxy.exe",
	linux: "grpcwebproxy_linux",
} as any;

export function startGRPCWebProxy() {
	if (!file[process.platform]) return;

	exec(
		`${path.join(
			__dirname,
			"..",
			"proxy",
			file[process.platform]
		)} --backend_tls=false --backend_addr=localhost:9090 --run_tls_server=false --allow_all_origins`,
		(err, stdout, stderr) => {
			if (err) console.error(err);
		}
	);
}
