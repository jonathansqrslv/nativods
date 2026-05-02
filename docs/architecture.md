# Arquitetura

Este repo contem tres superficies diferentes. A separacao abaixo ajuda a decidir onde cada mudanca deve entrar.

## Runtime do design system

Arquivos usados por aplicacoes consumidoras do Nativo:

- `nativo.css`: entrypoint CSS publico.
- `tokens/`: tokens CSS reais usados pelo runtime.
- `base/`: reset e estilos globais.
- `layout/`: container, grid e stack.
- `components/`: estilos dos componentes.
- `utilities/`: classes utilitarias.
- `js/`: comportamento publico do DS.

O pacote npm publica essa superficie por meio de `package.json#files`.

## Site de documentacao

Arquivos usados para demonstrar e documentar o DS:

- `index.html`
- `fundacao.html`
- `layout.html`
- `utilitarios.html`
- `site/componentes/*.html`
- `site/demo.css`
- `site/docs.js`

O site usa o runtime real, mas `site/docs.js` guarda apenas comportamento da documentacao: navbar, sidebar e alternancia de codigo nos exemplos.

## Figma e automacao

Arquivos usados para gerar ou sincronizar tokens com Figma:

- `figma/tokens/*.json`: tokens DTCG gerados para Figma.
- `docs/figma.md`: fluxo de importacao e sync.
- `scripts/export-figma-tokens.mjs`: gera JSON a partir dos CSS tokens.
- `scripts/sync-figma-variables.mjs`: prepara/aplica payload da Figma REST API.

`figma/tokens/figma-variables.payload.json` e um artefato temporario de dry-run e nao deve ser versionado.

## Regra pratica

- Mudou estilo usado por produto? Edite `tokens/`, `base/`, `layout/`, `components/`, `utilities/` ou `nativo.css`.
- Mudou comportamento de componente? Edite `js/`.
- Mudou exemplo, navegacao ou pagina de docs? Edite `site/` ou os HTMLs da raiz.
- Mudou interoperabilidade com Figma? Edite `figma/`, `docs/figma.md` ou `scripts/`.
