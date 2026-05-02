# Figma

Este projeto exporta uma versao dos tokens do Nativo para JSON no formato DTCG, pensado para importacao em Figma Variables.

## Gerar tokens

```bash
npm run tokens:figma
```

O comando le os arquivos CSS em `tokens/` e gera:

- `figma/tokens/nativo.primitives.tokens.json`
- `figma/tokens/nativo.semantic.light.tokens.json`
- `figma/tokens/nativo.semantic.dark.tokens.json`
- `figma/tokens/nativo.accents.tokens.json`
- `figma/tokens/nativo.reference.tokens.json`

## Como importar no Figma

1. Abra o arquivo do design system no Figma.
2. Abra o painel de Variables.
3. Use a acao de importar variables/tokens.
4. Importe primeiro `nativo.primitives.tokens.json`.
5. Importe `nativo.semantic.light.tokens.json` e `nativo.semantic.dark.tokens.json`.
6. Organize os semanticos como modes `light` e `dark` dentro da collection de cores.
7. Importe `nativo.accents.tokens.json` como base para os modes de acento.

## Sync via Figma REST API

O sync automatizado usa os tokens gerados em `figma/tokens/` e cria/atualiza Variables locais em um arquivo Figma.

Primeiro gere os tokens:

```bash
npm run tokens:figma
```

Depois rode um dry-run:

```bash
npm run figma:sync
```

O dry-run monta o payload e salva uma copia local em `figma/tokens/figma-variables.payload.json`. Esse arquivo e ignorado pelo Git.

Para comparar contra um arquivo Figma real sem aplicar mudancas:

```bash
FIGMA_FILE_KEY=abc123 FIGMA_TOKEN=figd_xxx npm run figma:sync
```

Para aplicar:

```bash
FIGMA_FILE_KEY=abc123 FIGMA_TOKEN=figd_xxx npm run figma:sync:apply
```

Requisitos da REST API de Variables:

- plano Enterprise;
- Full seat na organizacao;
- permissao de edicao no arquivo;
- token com scopes `file_variables:read` e `file_variables:write`.

O primeiro sync nao apaga variables existentes. Ele cria ou atualiza o que reconhece por nome de collection e nome de variable.

## Estrutura recomendada

Collections:

- `Nativo / Color`
- `Nativo / Spacing`
- `Nativo / Typography`
- `Nativo / Radius`
- `Nativo / Motion`

Modes de cor:

- `light`
- `dark`

Modes de acento:

- `mata-light`
- `mata-dark`
- `azul-light`
- `azul-dark`
- `cerrado-light`
- `cerrado-dark`
- `ipe-light`
- `ipe-dark`
- `terra-light`
- `terra-dark`
- `urucum-light`
- `urucum-dark`

Mantenha os tokens primitivos separados dos semanticos:

- Primitivos: `color/primitive/gray/100`, `spacing/4`, `typography/size/base`.
- Semanticos: `color/semantic/bg/surface`, `color/semantic/text/primary`, `color/semantic/interactive/default`.

No sync REST, a estrutura fica assim:

- `Nativo / Color`: cores primitivas com mode `default`.
- `Nativo / Theme`: cores semanticas com modes `light` e `dark`.
- `Nativo / Accent`: acentos com modes combinados de acento e tema, como `azul-light` e `azul-dark`.
- `Nativo / Spacing`, `Nativo / Typography`, `Nativo / Radius` e `Nativo / Motion`: foundations com mode `default`.

## Limites atuais

Sombras, easing e transicoes compostas nao tem o mesmo modelo no CSS e em Figma Variables. Por isso, o exportador mantem esses valores em `nativo.reference.tokens.json` como referencia de documentacao.

Os componentes do Figma devem ser montados usando essas variables, em vez de valores soltos. Comece por Button, Input, Badge, Alert e Card.
