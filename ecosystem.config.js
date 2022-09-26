const os = require("os");
const env = require("dotenv").config();

const cores = os.cpus().length;

module.exports = {
  apps: [
    {
      name: "plex-hue-control",
      script: "index.js",
      env: env.parsed,
      watch: ["build"],
      ignore_watch: ["node_modules"],
      watch_options: {
        followSymlinks: false
      },
      instances: "1",
      exec_mode: "cluster"
    }
  ]
};
