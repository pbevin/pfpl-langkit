// More info on Webpack's Node API here: https://webpack.github.io/docs/node.js-api.html
// Allowing console calls below since this is a build file.
/*eslint-disable no-console */
import webpack from "webpack";
import webpackConfigBuilder from "../webpack.config";
import "colors";
import { argv as args } from "yargs";

process.env.NODE_ENV = "production";

const logging = !args.s;
const webpackConfig = webpackConfigBuilder(process.env.NODE_ENV);

webpack(webpackConfig).run((err, stats) => {
  if (err) { // so a fatal error occurred. Stop here.
    console.log(err.bold.red);

    return 1;
  }

  const jsonStats = stats.toJson();

  if (jsonStats.hasErrors) {
    return jsonStats.errors.map(error => console.log(error.red));
  }

  if (jsonStats.hasWarnings && logging) {
    console.log("Webpack generated the following warnings: ".bold.yellow);
    jsonStats.warnings.map(warning => console.log(warning.yellow));
  }

  if (logging) {
    console.log(`Webpack stats: ${stats}`);
  }

  console.log("Production build is in ./dist".green.bold);

  return 0;
});
