# Contributing

This module is under the MIT license and is accepting merge requests and issue reports. Feel free to submit improvements to the module, and I'll review them and merge them if they seem useful for the module.

# How to use the system locally

With the change to LevelDB, there is an extra step to create the packs locally.

- Clone the repository as usual
- You need to have a node.js installation done
- run `npm install`: will generate the node_modules depending on package.json and package-lock.json
- then `npm run build` to build once or `npm run watch` to have a SCSS watcher running to update the CSS when SCSS is updated automatically.
- If you want Foundry to hot-reload pages as you make updates, you will need to launch Foundry with the `--hotReload` flag. See [Using Command Line Flags](https://foundryvtt.com/article/configuration/)
- `npm run createSymlinks` - Create development symlinks for improved intellisense
  - You will need to update `example-foundry-config.yaml` & `example-jsconfig.json`
  - documentation: https://foundryvtt.wiki/en/development/guides/improving-intellisense
