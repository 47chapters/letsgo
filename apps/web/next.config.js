const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui", "lucide-react"],
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};
