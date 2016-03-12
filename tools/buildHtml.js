// Allowing console calls below since this is a build file.
/*eslint-disable no-console */

import fs from "fs";
import "colors";
import cheerio from "cheerio";

fs.readFile("src/index.html", "utf8", (err, content) => {
  if (err) {
    return console.log(err);
  }

  const $ = cheerio.load(content);
  $("head").prepend("<link rel=\"stylesheet\" href=\"styles.css\">");

  fs.writeFile("dist/index.html", $.html(), "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
  });
});

