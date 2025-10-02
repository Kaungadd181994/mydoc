const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "pages");
const outputFile = path.join(__dirname, "pages.json");

function cleanLabel(name) {
  // remove numeric prefix, e.g. "1intro.md" → "Intro"
  return name.replace(/^\d+/, "").replace(/\.md$/, "").replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function scanPages(dir) {
  const groups = {};
  const folders = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());

  folders.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const folder of folders) {
    const groupPath = path.join(dir, folder);
    const files = fs.readdirSync(groupPath).filter(f => f.endsWith(".md"));

    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    groups[folder] = {
      label: cleanLabel(folder),
      pages: files.map(file => ({
        file,
        label: cleanLabel(file)
      }))
    };
  }

  return groups;
}

const pages = scanPages(pagesDir);
fs.writeFileSync(outputFile, JSON.stringify(pages, null, 2));

console.log("✅ pages.json generated");
