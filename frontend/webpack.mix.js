const fs = require("fs");
const mix = require("laravel-mix");
require("mix-tailwindcss");

function getIndexHtml() {
  const hashes = JSON.parse(fs.readFileSync("dist/mix-manifest.json"));
  // replace {{ mix('file') }} with the hashed file path
  let content = fs.readFileSync("src/index.html").toString();
  content = content.replace(
    /{{ mix\('(.+?)'\) }}/g,
    (_, file) => hashes[file] ?? file
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
  .version();

mix.browserSync({
  watch: true,
  server: "dist",
  middleware: [
    {
      route: "/",
      handle: (req, res, next) => {
        res.write(getIndexHtml());
        res.end();
      },
    },
  ],
});
