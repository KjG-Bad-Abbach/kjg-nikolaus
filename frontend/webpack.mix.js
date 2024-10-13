const mix = require("laravel-mix");
require("mix-tailwindcss");

mix
  .js("src/js/app.js", "js")
  .sourceMaps()
  // .sass('src/sass/app.scss', 'css')
  .postCss("src/css/app.css", "css")
  .tailwind()
  .copy("src/index.html", "dist/index.html")
  .setPublicPath("dist");

mix.browserSync({
  watch: true,
  server: "dist",
});
