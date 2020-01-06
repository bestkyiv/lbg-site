const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const rimraf = require("rimraf");
const util = require("util");

(async () => {
  const ejsFiles = findFilesWithExtension("./public", "ejs");

  await util.promisify(rimraf)("./public/en");

  const directories = ejsFiles.map(p =>
    path.resolve("./public/en", path.dirname(p))
  );
  for (const dir of directories) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  for (const ejsFileName of ejsFiles) {
    const htmlFileName = path.join(
      path.dirname(ejsFileName),
      path.basename(ejsFileName, path.extname(ejsFileName)) + ".html"
    );

    const template = String(
      await fs.promises.readFile(path.resolve("./public", ejsFileName))
    );
    const compiledTemplate = _.template(template);

    const renderedHtmlUA = compiledTemplate({
      LANG: "UA",
      __: ua => ua
    });
    await fs.promises.writeFile(
      path.resolve("./public/", htmlFileName),
      renderedHtmlUA
    );

    const renderedHtmlEN = compiledTemplate({
      LANG: "EN",
      __: (ua, uk) => uk || ua
    });
    await fs.promises.writeFile(
      path.resolve("./public/en/", htmlFileName),
      renderedHtmlEN
    );
  }
})();

function findFilesWithExtension(base, ext, files, result = []) {
  files = files || fs.readdirSync(base);
  files.forEach(file => {
    const newBase = path.join(base, file);
    if (fs.statSync(newBase).isDirectory()) {
      result = findFilesWithExtension(
        newBase,
        ext,
        fs.readdirSync(newBase),
        result
      );
    } else {
      if (file.substr(-1 * (ext.length + 1)) === "." + ext) {
        result.push(newBase);
      }
    }
  });
  return result.map(p =>
    path.relative("./public", path.resolve(p)).replace(/^(?:\.\.\/)+/, "")
  );
}
