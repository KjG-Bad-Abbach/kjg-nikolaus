const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const mix = require("laravel-mix");
require("mix-tailwindcss");

function getHtml(file = "index.html") {
  const hashes = JSON.parse(fs.readFileSync("dist/mix-manifest.json"));
  // replace {{ mix('file') }} with the hashed file path
  let content = fs.readFileSync(path.join("src", file)).toString();
  content = content.replace(
    /{{ mix\('(.+?)'\) }}/g,
    (_, file) => hashes[file] ?? file,
  );
  return content;
}

mix
  .js("src/js/app.js", "js")
  .sourceMaps()
  // .sass('src/sass/app.scss', 'css')
  .postCss("src/css/app.css", "css")
  .tailwind()
  .setPublicPath("dist")
  .version()
  .webpackConfig({
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          API_TOKEN: JSON.stringify(process.env.API_TOKEN),
          API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
        },
      }),
    ],
  })
  .then(() => {
    const updatedContent = getHtml();
    fs.writeFileSync("dist/index.html", updatedContent);
  });

mix.browserSync({
  watch: true,
  server: "dist",
  middleware: [
    {
      route: "/",
      handle: (req, res, next) => {
        res.write(getHtml());
        res.end();
      },
    },
    {
      route: "/colors",
      handle: (req, res, next) => {
        res.write(getHtml("colors.html"));
        res.end();
      },
    },
  ],
});
