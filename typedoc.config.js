/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ["src"],
  out: ".docs",
  plugin: ["typedoc-plugin-markdown"],
  readme: "none",
  githubPages: false,
  hideGenerator: true,
  cleanOutputDir: true,
};
