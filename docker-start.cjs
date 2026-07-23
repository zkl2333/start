const { execFileSync } = require("node:child_process");
const path = require("node:path");

const dataPath = path.resolve(__dirname, "docker-data");
const cachePath = path.resolve(__dirname, "docker-data", "cache");

execFileSync(
  "docker",
  [
    "run",
    "--name",
    "start",
    "-p",
    "3000:3000",
    "-v",
    `${dataPath}:/app/data`,
    "-v",
    `${cachePath}:/app/.next/cache`,
    "--rm",
    "start",
  ],
  { stdio: "inherit" }
);
