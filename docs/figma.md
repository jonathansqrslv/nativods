# Figma

Este projeto exporta uma versao dos tokens do Nativo para JSON no formato DTCG, pensado para importacao em Figma Variables.

## Gerar tokens

```bash
npm run tokens:figma
```

O comando le os arquivos CSS em `tokens/` e gera:

- `tokens/figma/nativo.primitives.tokens.json`
- `tokens/figma/nativo.semantic.light.tokens.json`
- `tokens/figma/nativo.semantic.dark.tokens.json`
- `tokens/figma/nativo.accents.tokens.json`
- `tokens/figma/nativo.reference.tokens.json`

## Como importar no Figma

1. Abra o arquivo do design system no Figma.
2. Abra o painel de Variables.
3. Use a acao de importar variables/tokens.
4. Importe primeiro `nativo.primitives.tokens.json`.
5. Importe `nativo.semantic.light.tokens.json` e `nativo.semantic.dark.tokens.json`.
6. Organize os semanticos como modes `light` e `dark` dentro da collection de cores.
7. Importe `nativo.accents.tokens.json` como base para os modes de acento.

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
- `mata`
- `azul`
- `cerrado`
- `ipe`
- `terra`
- `urucum`

Mantenha os tokens primitivos separados dos semanticos:

- Primitivos: `color/primitive/gray/100`, `spacing/4`, `typography/size/base`.
- Semanticos: `color/semantic/bg/surface`, `color/semantic/text/primary`, `color/semantic/interactive/default`.

## Limites atuais

Sombras, easing e transicoes compostas nao tem o mesmo modelo no CSS e em Figma Variables. Por isso, o exportador mantem esses valores em `nativo.reference.tokens.json` como referencia de documentacao.

Os componentes do Figma devem ser montados usando essas variables, em vez de valores soltos. Comece por Button, Input, Badge, Alert e Card.
