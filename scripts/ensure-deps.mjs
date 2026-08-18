import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const required = ["bootstrap", "react-bootstrap", "@mui/material", "@emotion/react", "@emotion/styled"];
const missing = required.filter((name) => !existsSync(`node_modules/${name}`));

if (missing.length) {
  console.log(`Missing frontend dependencies: ${missing.join(", ")}`);
  console.log("Running npm install before starting/building Rebel Tech...");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["install"], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
