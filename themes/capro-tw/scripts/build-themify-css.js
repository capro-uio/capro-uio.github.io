const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../node_modules/themify-icons/themify-icons");
const outFile = path.join(__dirname, "../assets/css/vendor/themify-icons.css");

const icons = fs.readFileSync(path.join(srcDir, "_icons.scss"), "utf8");

const fontFace = `@font-face {
  font-family: themify;
  display: swap;
  src: url(/webfonts/themify/themify.eot?-fvbane);
  src: url(/webfonts/themify/themify.eot?#iefix-fvbane) format('embedded-opentype'),
       url(/webfonts/themify/themify.woff?-fvbane) format('woff'),
       url(/webfonts/themify/themify.ttf?-fvbane) format('truetype'),
       url(/webfonts/themify/themify.svg?-fvbane#themify) format('svg');
  font-weight: 400;
  font-style: normal;
}`;

const base = `[class^="ti-"],
[class*=" ti-"] {
  font-family: themify;
  speak: none;
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

const tiIcons = icons.replace(/\.icon-/g, ".ti-");

const css = [fontFace, base, tiIcons].join("\n");

fs.writeFileSync(outFile, css);
console.log("Generated", outFile);
