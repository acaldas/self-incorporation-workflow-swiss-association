// Bakes the legal markdown templates into a plain TS module.
// tsdown/rolldown (6.2 build) can't resolve Vite's `?raw`; run: npm run gen:templates
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// varName -> markdown source path (relative to project root)
const templates = {
  aoaTemplateRaw:
    "oh legal  templates.md/_[TEMPLATE] default AoA OH _ standard  - .docx.md",
  foundingMinutesTemplateRaw:
    "oh legal  templates.md/[TEMPLATE] OH Founding Meeting Minutes.md",
  contributorAgreementTemplateRaw:
    "oh legal  templates.md/[TEMPLATE] Contributor Agreement.md",
  mpaV2TemplateRaw:
    "OH legal incorporation templates copy.md/[TEMPLATE]  MPA v2.docx.md",
  regulationGATemplateRaw:
    "OH legal incorporation templates copy.md/[TEMPLATE] OH  Regs General Assembly.md",
  dissolutionResolutionTemplateRaw:
    "OH legal incorporation templates copy.md/[TEMPLATE] OH Dissolution Resolution.md",
};

const outPath = resolve(
  root,
  "editors/swiss-association/components/stage2Templates.generated.ts",
);

// AUTO-GENERATED header for the emitted file
let out =
  "// AUTO-GENERATED - DO NOT EDIT. Regenerate with: npm run gen:templates\n\n";

for (const [name, relPath] of Object.entries(templates)) {
  const content = readFileSync(resolve(root, relPath), "utf8");
  out += `export const ${name} = ${JSON.stringify(content)};\n\n`;
}

writeFileSync(outPath, out);
console.log(`Wrote ${outPath}`);
