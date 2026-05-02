import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const tokensDir = path.join(rootDir, "figma", "tokens");
const defaultPayloadPath = path.join(tokensDir, "figma-variables.payload.json");

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const dryRun = !apply;
const writePayload = args.has("--write-payload");

const fileKey = readArg("--file-key") ?? process.env.FIGMA_FILE_KEY;
const token = process.env.FIGMA_TOKEN;

const collectionNames = {
  color: "Nativo / Color",
  theme: "Nativo / Theme",
  accent: "Nativo / Accent",
  spacing: "Nativo / Spacing",
  typography: "Nativo / Typography",
  radius: "Nativo / Radius",
  motion: "Nativo / Motion",
};

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function readJson(file) {
  return JSON.parse(await readFile(path.join(tokensDir, file), "utf8"));
}

function isToken(node) {
  return Boolean(node && typeof node === "object" && "$value" in node && "$type" in node);
}

function flattenTokens(node, trail = []) {
  if (isToken(node)) {
    return [{ path: trail, token: node }];
  }

  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return [];
  }

  return Object.entries(node).flatMap(([key, value]) => flattenTokens(value, [...trail, key]));
}

function figmaType(type) {
  if (type === "color") return "COLOR";
  if (["dimension", "duration", "number"].includes(type)) return "FLOAT";
  return "STRING";
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  if (hex) {
    let raw = hex[1];

    if (raw.length === 3) {
      raw = raw.split("").map((char) => `${char}${char}`).join("");
    }

    const r = Number.parseInt(raw.slice(0, 2), 16) / 255;
    const g = Number.parseInt(raw.slice(2, 4), 16) / 255;
    const b = Number.parseInt(raw.slice(4, 6), 16) / 255;
    const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;

    return { r, g, b, a };
  }

  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);

  if (rgba) {
    return {
      r: Number(rgba[1]) / 255,
      g: Number(rgba[2]) / 255,
      b: Number(rgba[3]) / 255,
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }

  throw new Error(`Unsupported color value: ${value}`);
}

function parseFloatValue(value) {
  if (typeof value === "number") {
    return value;
  }

  if (value === "0") {
    return 0;
  }

  const rem = String(value).match(/^(-?[\d.]+)rem$/);
  if (rem) {
    return Number(rem[1]) * 16;
  }

  const px = String(value).match(/^(-?[\d.]+)px$/);
  if (px) {
    return Number(px[1]);
  }

  const ms = String(value).match(/^(-?[\d.]+)ms$/);
  if (ms) {
    return Number(ms[1]);
  }

  const plain = String(value).match(/^-?[\d.]+$/);
  if (plain) {
    return Number(value);
  }

  throw new Error(`Unsupported float value: ${value}`);
}

function toFigmaValue(token) {
  const value = token.$value;

  if (token.$type === "color") {
    return parseColor(value);
  }

  if (["dimension", "duration", "number"].includes(token.$type)) {
    return parseFloatValue(value);
  }

  return String(value);
}

function addVariable(model, collectionName, modeName, name, token) {
  const figmaName = sanitizeVariableName(name);
  const key = `${collectionName}::${figmaName}`;
  const resolvedType = figmaType(token.$type);

  model.collections.set(collectionName, model.collections.get(collectionName) ?? new Set());
  model.collections.get(collectionName).add(modeName);

  if (!model.variables.has(key)) {
    model.variables.set(key, {
      collectionName,
      name: figmaName,
      resolvedType,
      description: token.$description ?? "",
      valuesByMode: new Map(),
      codeSyntax: cssCodeSyntax(token.$description),
    });
  }

  const variable = model.variables.get(key);

  if (variable.resolvedType !== resolvedType) {
    throw new Error(`Type mismatch for ${collectionName}/${name}`);
  }

  variable.valuesByMode.set(modeName, toFigmaValue(token));
}

function sanitizeVariableName(name) {
  return name.replace(/[.{}]/g, "_");
}

function cssCodeSyntax(description) {
  if (!description?.startsWith("--")) {
    return undefined;
  }

  return { WEB: `var(${description})` };
}

function addFlatTokens(model, tree, collectionResolver, modeName = "default") {
  for (const { path: tokenPath, token } of flattenTokens(tree)) {
    const resolved = collectionResolver(tokenPath, token);

    if (!resolved) {
      continue;
    }

    addVariable(model, resolved.collectionName, modeName, resolved.name, token);
  }
}

function addAccentModes(model, accents) {
  for (const [accentName, modes] of Object.entries(accents)) {
    for (const modeName of ["light", "dark"]) {
      const tree = modes[modeName];

      if (!tree) {
        continue;
      }

      addFlatTokens(
        model,
        tree,
        (tokenPath) => {
          if (tokenPath[0] !== "color") {
            return null;
          }

          return {
            collectionName: collectionNames.accent,
            name: tokenPath.slice(1).join("/"),
          };
        },
        `${accentName}-${modeName}`,
      );
    }
  }
}

function addMataAccentModes(model, primitives, semanticLight, semanticDark) {
  const colorTokens = flattenTokens(primitives).filter(({ path: tokenPath }) => (
    tokenPath[0] === "color" &&
    tokenPath[1] === "primitive" &&
    tokenPath[2] === "accent"
  ));

  for (const modeName of ["mata-light", "mata-dark"]) {
    for (const { path: tokenPath, token } of colorTokens) {
      addVariable(model, collectionNames.accent, modeName, tokenPath.slice(1).join("/"), token);
    }
  }

  for (const [modeName, tree] of [["mata-light", semanticLight], ["mata-dark", semanticDark]]) {
    const semanticAccentTokens = flattenTokens(tree).filter(({ path: tokenPath }) => (
      tokenPath.join("/").startsWith("color/semantic/interactive/") ||
      tokenPath.join("/") === "color/semantic/border/focus"
    ));

    for (const { path: tokenPath, token } of semanticAccentTokens) {
      addVariable(model, collectionNames.accent, modeName, tokenPath.slice(1).join("/"), token);
    }
  }
}

async function buildModel() {
  const primitives = await readJson("nativo.primitives.tokens.json");
  const semanticLight = await readJson("nativo.semantic.light.tokens.json");
  const semanticDark = await readJson("nativo.semantic.dark.tokens.json");
  const accents = await readJson("nativo.accents.tokens.json");

  const model = {
    collections: new Map(),
    variables: new Map(),
  };

  addFlatTokens(model, primitives, (tokenPath) => {
    const [category, ...rest] = tokenPath;

    if (category === "color") {
      return { collectionName: collectionNames.color, name: rest.join("/") };
    }

    if (category === "spacing") {
      return { collectionName: collectionNames.spacing, name: rest.join("/") };
    }

    if (category === "typography") {
      return { collectionName: collectionNames.typography, name: rest.join("/") };
    }

    if (category === "radius") {
      return { collectionName: collectionNames.radius, name: rest.join("/") };
    }

    if (category === "motion") {
      return { collectionName: collectionNames.motion, name: rest.join("/") };
    }

    return null;
  });

  addFlatTokens(
    model,
    semanticLight,
    (tokenPath) => ({ collectionName: collectionNames.theme, name: tokenPath.slice(1).join("/") }),
    "light",
  );

  addFlatTokens(
    model,
    semanticDark,
    (tokenPath) => ({ collectionName: collectionNames.theme, name: tokenPath.slice(1).join("/") }),
    "dark",
  );

  addMataAccentModes(model, primitives, semanticLight, semanticDark);
  addAccentModes(model, accents);

  return model;
}

function tempId(prefix, value) {
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
}

function normalizeExisting(meta) {
  const collections = new Map();
  const variables = new Map();

  for (const collection of Object.values(meta?.variableCollections ?? {})) {
    const modes = new Map(collection.modes.map((mode) => [mode.name, mode.id]));
    collections.set(collection.name, { ...collection, modes });
  }

  for (const variable of Object.values(meta?.variables ?? {})) {
    const collection = Object.values(meta?.variableCollections ?? {}).find((item) => (
      item.id === variable.variableCollectionId
    ));

    if (!collection) {
      continue;
    }

    variables.set(`${collection.name}::${variable.name}`, variable);
  }

  return { collections, variables };
}

function buildPayload(model, existing = { collections: new Map(), variables: new Map() }) {
  const payload = {
    variableCollections: [],
    variableModes: [],
    variables: [],
    variableModeValues: [],
  };

  const collectionRefs = new Map();
  const modeRefs = new Map();
  const variableRefs = new Map();

  for (const [collectionName, modes] of model.collections) {
    const existingCollection = existing.collections.get(collectionName);
    const collectionId = existingCollection?.id ?? tempId("collection", collectionName);
    collectionRefs.set(collectionName, collectionId);

    const orderedModes = [...modes];

    if (!existingCollection) {
      const initialModeId = tempId("mode", `${collectionName}_${orderedModes[0]}`);
      payload.variableCollections.push({
        action: "CREATE",
        id: collectionId,
        name: collectionName,
        initialModeId,
      });

      payload.variableModes.push({
        action: "UPDATE",
        id: initialModeId,
        name: orderedModes[0],
        variableCollectionId: collectionId,
      });

      modeRefs.set(`${collectionName}::${orderedModes[0]}`, initialModeId);
    }

    for (const modeName of orderedModes) {
      const existingModeId = existingCollection?.modes.get(modeName);

      if (existingModeId) {
        modeRefs.set(`${collectionName}::${modeName}`, existingModeId);
        continue;
      }

      if (!modeRefs.has(`${collectionName}::${modeName}`)) {
        const modeId = tempId("mode", `${collectionName}_${modeName}`);
        payload.variableModes.push({
          action: "CREATE",
          id: modeId,
          name: modeName,
          variableCollectionId: collectionId,
        });
        modeRefs.set(`${collectionName}::${modeName}`, modeId);
      }
    }
  }

  for (const [key, variable] of model.variables) {
    const existingVariable = existing.variables.get(key);
    const variableId = existingVariable?.id ?? tempId("variable", `${variable.collectionName}_${variable.name}`);
    variableRefs.set(key, variableId);

    const baseChange = {
      action: existingVariable ? "UPDATE" : "CREATE",
      id: variableId,
      name: variable.name,
      description: variable.description,
    };

    if (variable.codeSyntax) {
      baseChange.codeSyntax = variable.codeSyntax;
    }

    if (!existingVariable) {
      baseChange.resolvedType = variable.resolvedType;
      baseChange.variableCollectionId = collectionRefs.get(variable.collectionName);
    }

    payload.variables.push(baseChange);
  }

  for (const [key, variable] of model.variables) {
    const variableId = variableRefs.get(key);

    for (const [modeName, value] of variable.valuesByMode) {
      payload.variableModeValues.push({
        variableId,
        modeId: modeRefs.get(`${variable.collectionName}::${modeName}`),
        value,
      });
    }
  }

  return payload;
}

async function figmaRequest(endpoint, options = {}) {
  if (!token) {
    throw new Error("Missing FIGMA_TOKEN");
  }

  const response = await fetch(`https://api.figma.com${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Figma-Token": token,
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Figma API ${response.status}: ${body.message ?? JSON.stringify(body)}`);
  }

  return body;
}

function summarize(model, payload, hasExisting) {
  const modeCount = [...model.collections.values()].reduce((sum, modes) => sum + modes.size, 0);
  const valueCount = [...model.variables.values()].reduce((sum, variable) => sum + variable.valuesByMode.size, 0);

  console.log(`Collections: ${model.collections.size}`);
  console.log(`Modes: ${modeCount}`);
  console.log(`Variables: ${model.variables.size}`);
  console.log(`Mode values: ${valueCount}`);
  console.log("");
  console.log(hasExisting ? "Payload against current Figma file:" : "Payload assuming an empty Figma file:");
  console.log(`- collections: ${payload.variableCollections.length}`);
  console.log(`- modes: ${payload.variableModes.length}`);
  console.log(`- variables: ${payload.variables.length}`);
  console.log(`- values: ${payload.variableModeValues.length}`);
}

async function main() {
  const model = await buildModel();
  let existing = { collections: new Map(), variables: new Map() };
  let hasExisting = false;

  if ((apply || token) && fileKey) {
    const localVariables = await figmaRequest(`/v1/files/${fileKey}/variables/local`);
    existing = normalizeExisting(localVariables.meta);
    hasExisting = true;
  }

  const payload = buildPayload(model, existing);

  summarize(model, payload, hasExisting);

  if (writePayload || dryRun) {
    await writeFile(defaultPayloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Payload written to ${path.relative(rootDir, defaultPayloadPath)}`);
  }

  if (dryRun) {
    console.log("Dry-run only. Use --apply with FIGMA_FILE_KEY and FIGMA_TOKEN to sync.");
    return;
  }

  if (!fileKey) {
    throw new Error("Missing FIGMA_FILE_KEY or --file-key");
  }

  await figmaRequest(`/v1/files/${fileKey}/variables`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("Figma variables synced.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
