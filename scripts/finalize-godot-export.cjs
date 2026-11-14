const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "../assets/godot/index.html");
let html = fs.readFileSync(file, "utf8");

const progressNeedle = "'onProgress': function (current, total) {";
const progressReplacement =
  "'onProgress': function (current, total) {\n" +
  "\t\t\t\twindow.parent.postMessage({ type: 'luminara-godot-progress', current: current, total: total }, '*');";
html = html.replace(progressNeedle, progressReplacement);
html = html.replace(
  "function displayFailureNotice(err) {\n\t\tconsole.error(err);",
  "function displayFailureNotice(err) {\n\t\tconsole.error(err);\n" +
    "\t\twindow.parent.postMessage({ type: 'luminara-godot-error', message: String(err && err.message || err) }, '*');"
);
if (!html.includes("luminara-godot-close")) {
  html = html.replace(
    "</body>",
    "<script>window.addEventListener('keydown',function(event){if(event.key==='Escape'){window.parent.postMessage('luminara-godot-close','*');}},true);</script>\n\t</body>"
  );
}

if (!html.includes("luminara-godot-progress")) {
  throw new Error("Could not add Godot progress bridge");
}

fs.writeFileSync(file, html);
console.log("Finalized Godot HTML bridge");
