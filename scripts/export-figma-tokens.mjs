import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "figma", "tokens");

const sourceFiles = [
  "tokens/colors.css",
  "tokens/spacing.css",
  "tokens/typography.css",
  "tokens/radii.css",
  "tokens/motion.css",
  "tokens/shadows.css",
];

const accentFiles = {
  azul: "tokens/themes/azul.css",
  cerrado: "tokens/themes/cerrado.css",
  ipe: "tokens/themes/ipe.css",
  terra: "tokens/themes/terra.css",
  urucum: "tokens/themes/urucum.css",
};

const semanticPrefixes = [
  "bg",
  "border",
  "text",
  "interactive",
  "feedback",
];

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function findBlock(css, selector) {
  const index = css.indexOf(selector);

  if (index === -1) {
    return "";
  }

  const openIndex = css.indexOf("{", index);

  if (openIndex === -1) {
    return "";
  }

  let depth = 0;

  for (let i = openIndex; i < css.length; i += 1) {
    if (css[i] === "{") {
      depth += 1;
    }

    if (css[i] === "}") {
      depth -= 1;

      if (depth === 0) {
        return css.slice(openIndex + 1, i);
      }
    }
  }

  return "";
}

function parseDeclarations(block) {
  const declarations = {};
  const matches = block.matchAll(/(--[a-zA-Z0-9_.\\-]+)\s*:\s*([^;]+);/g);

  for (const match of matches) {
    const name = match[1].replaceAll("\\.", ".");
    declarations[name] = match[2].replace(/\s+/g, " ").trim();
  }

  return declarations;
}

function merge(target, source) {
  return Object.assign(target, source);
}

function resolveValue(value, context, stack = []) {
  return value.replace(/var\((--[a-zA-Z0-9_.-]+)(?:,\s*([^)]+))?\)/g, (_, name, fallback) => {
    if (stack.includes(name)) {
      return fallback?.trim() ?? value;
    }

    const next = context[name];

    if (!next) {
      return fallback?.trim() ?? `var(${name})`;
    }

    return resolveValue(next, context, [...stack, name]);
  });
}

function inferType(name, value) {
  if (name.startsWith("--font-")) {
    return "fontFamily";
  }

  if (name.startsWith("--duration-")) {
    return "duration";
  }

  if (
    name.startsWith("--color-") ||
    name.startsWith("--bg-") ||
    name.startsWith("--border-") ||
    name.startsWith("--interactive-") ||
    name.startsWith("--feedback-") ||
    name.startsWith("--text-")
  ) {
    if (/^(#|rgba?\(|hsla?\()/i.test(value)) {
      return "color";
    }
  }

  if (
    name.startsWith("--space-") ||
    name.startsWith("--radius-") ||
    name.startsWith("--text-")
  ) {
    return "dimension";
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return "number";
  }

  return "string";
}

function tokenPath(name, type) {
  const clean = name.replace(/^--/, "");
  const parts = clean.split("-");

  if (parts[0] === "color") {
    return ["color", "primitive", ...parts.slice(1)];
  }

  if (parts[0] === "font") {
    return ["typography", "font", parts.slice(1).join("-")];
  }

  if (parts[0] === "text") {
    if (type === "color") {
      return ["color", "semantic", "text", ...parts.slice(1)];
    }

    return ["typography", "size", parts.slice(1).join("-")];
  }

  if (parts[0] === "weight") {
    return ["typography", "weight", parts.slice(1).join("-")];
  }

  if (parts[0] === "leading") {
    return ["typography", "leading", parts.slice(1).join("-")];
  }

  if (parts[0] === "tracking") {
    return ["typography", "tracking", parts.slice(1).join("-")];
  }

  if (parts[0] === "space") {
    return ["spacing", parts.slice(1).join("-")];
  }

  if (parts[0] === "radius") {
    return ["radius", parts.slice(1).join("-")];
  }

  if (parts[0] === "duration") {
    return ["motion", "duration", parts.slice(1).join("-")];
  }

  if (parts[0] === "ease") {
    return ["motion", "easing", parts.slice(1).join("-")];
  }

  if (parts[0] === "shadow") {
    if (parts[1] === "focus" && parts.length === 2) {
      return ["effect", "shadow", "focus", "default"];
    }

    return ["effect", "shadow", parts.slice(1).join("-")];
  }

  if (parts[0] === "transition") {
    return ["motion", "transition", parts.slice(1).join("-")];
  }

  if (semanticPrefixes.includes(parts[0])) {
    if (parts[0] === "bg" && parts[1] === "surface" && parts.length === 2) {
      return ["color", "semantic", "bg", "surface", "default"];
    }

    if (parts[0] === "interactive" && parts[1] === "subtle" && parts.length === 2) {
      return ["color", "semantic", "interactive", "subtle", "default"];
    }

    return ["color", "semantic", parts[0], ...parts.slice(1)];
  }

  return [clean];
}

function setToken(tree, parts, value, type, description) {
  let node = tree;

  for (const part of parts.slice(0, -1)) {
    node[part] ??= {};
    node = node[part];
  }

  node[parts.at(-1)] = {
    $value: value,
    $type: type,
  };

  if (description) {
    node[parts.at(-1)].$description = description;
  }
}

function buildTokens(vars, context, filter = () => true) {
  const tree = {};

  for (const [name, rawValue] of Object.entries(vars)) {
    const value = resolveValue(rawValue, context);
    const type = inferType(name, value);

    if (!filter(name, type)) {
      continue;
    }

    setToken(tree, tokenPath(name, type), value, type, name);
  }

  return tree;
}

function isPrimitive(name, type) {
  return (
    name.startsWith("--color-") ||
    name.startsWith("--space-") ||
    name.startsWith("--font-") ||
    (name.startsWith("--text-") && type === "dimension") ||
    name.startsWith("--weight-") ||
    name.startsWith("--leading-") ||
    name.startsWith("--tracking-") ||
    name.startsWith("--radius-") ||
    name.startsWith("--duration-") ||
    name.startsWith("--ease-")
  );
}

function isSemanticColor(name, type) {
  return type === "color" && semanticPrefixes.some((prefix) => name.startsWith(`--${prefix}-`));
}

async function readCss(file) {
  return stripComments(await readFile(path.join(rootDir, file), "utf8"));
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const rootVars = {};
  const darkVars = {};

  for (const file of sourceFiles) {
    const css = await readCss(file);
    merge(rootVars, parseDeclarations(findBlock(css, ":root")));
    merge(darkVars, parseDeclarations(findBlock(css, '[data-theme="dark"]')));
  }

  const lightContext = { ...rootVars };
  const darkContext = { ...rootVars, ...darkVars };
  const accentVars = {};

  for (const [accent, file] of Object.entries(accentFiles)) {
    const css = await readCss(file);
    const light = parseDeclarations(findBlock(css, `[data-accent="${accent}"]`));
    const dark = parseDeclarations(findBlock(css, `[data-accent="${accent}"][data-theme="dark"]`));

    accentVars[accent] = {
      light,
      dark,
    };
  }

  const primitives = buildTokens(rootVars, lightContext, isPrimitive);
  const semanticLight = buildTokens(rootVars, lightContext, isSemanticColor);
  const semanticDark = buildTokens(darkVars, darkContext, isSemanticColor);

  const accents = {};

  for (const [accent, modes] of Object.entries(accentVars)) {
    accents[accent] = {
      light: buildTokens(modes.light, { ...lightContext, ...modes.light }),
      dark: buildTokens(modes.dark, { ...darkContext, ...modes.light, ...modes.dark }),
    };
  }

  const reference = {
    $description: "Tokens CSS do Nativo que nao mapeiam 1:1 para Figma Variables.",
    effect: buildTokens(rootVars, lightContext, (name) => name.startsWith("--shadow-")).effect,
    transition: buildTokens(rootVars, lightContext, (name) => name.startsWith("--transition-")).motion?.transition,
  };

  const files = {
    "nativo.primitives.tokens.json": primitives,
    "nativo.semantic.light.tokens.json": semanticLight,
    "nativo.semantic.dark.tokens.json": semanticDark,
    "nativo.accents.tokens.json": accents,
    "nativo.reference.tokens.json": reference,
  };

  for (const [file, contents] of Object.entries(files)) {
    await writeFile(
      path.join(outDir, file),
      `${JSON.stringify(contents, null, 2)}\n`,
      "utf8",
    );
  }

  console.log(`Generated ${Object.keys(files).length} Figma token files in ${path.relative(rootDir, outDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
