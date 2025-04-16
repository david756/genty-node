module.exports = {
    apps: [
      {
        name: "genty",
        script: "server.js",
        watch: true,
        ignore_watch: ["node_modules", "logs", ".git"],
        watch_delay: 1000,
      },
    ],
  };