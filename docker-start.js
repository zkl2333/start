const { execSync } = require("child_process");
const path = require("path");

const dataPath = path.resolve(__dirname, "docker-data");
const cachePath = path.resolve(__dirname, "docker-data", "cache");

const command = `docker run --name start -p 3000:3000 -v ${dataPath}:/app/data -v ${cachePath}:/app/.next/cache --rm start`;

execSync(command, { stdio: "inherit" });
