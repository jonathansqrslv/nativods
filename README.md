# Brisa — Design System Brasileiro

Um sistema silencioso, mas vivo.

Brisa é um design system CSS-first para interfaces que precisam de presença sem ruído. Ele nasce de uma sensibilidade brasileira sem recorrer a símbolos prontos: tons de matéria, ritmo no espaço, tipografia com voz e componentes que sustentam a experiência sem disputar atenção.

## Manifesto

Criamos interfaces que não gritam.
Elas respiram.

Brasilidade, aqui, não é ornamento.
É ritmo, calor e presença.

O sistema não impõe identidade.
Ele cria espaço para que ela apareça.

Preferimos tons naturais a cores óbvias, tipografia com voz a efeitos, pausas bem medidas a grids rígidos.

Rejeitamos a estética genérica de template, componentes inflados de estilo e tendências rápidas tratadas como padrão.

Brisa não tenta impressionar.
Ela sustenta.

## Uso

### Link direto

```html
<head>
  <link rel="stylesheet" href="brisa.css">
</head>
<body>
  <script type="module" src="js/brisa.js"></script>
</body>
```

### Com bundler

```js
import './design-system/brisa.css';
import './design-system/js/brisa.js';
```

### Primeiro componente

```html
<button class="btn btn--solid">Salvar</button>

<div class="card">
  <div class="card__header">
    <h2 class="card__title">Resumo</h2>
  </div>
  <div class="card__body">
    <p>Conteúdo do card.</p>
  </div>
</div>
```

## Pacotes e nomes

Use `Brisa` como nome público do sistema.

```css
@import '@brisa/system/brisa.css';
```

```js
import { Brisa } from '@brisa/system/js/brisa.js';
```

`ds.css`, `js/ds.js` e `window.DS` continuam disponíveis para projetos que já dependem desses nomes. Em código novo, prefira `brisa.css`, `js/brisa.js` e `window.Brisa`.

## Estrutura

A estrutura separa fundamento, composição e comportamento. O CSS carrega a identidade; o JavaScript entra só onde existe interação.

```text
design-system/
├── brisa.css                 entry point principal
├── ds.css                    entry point legado
├── index.html                demo visual
├── tokens/
│   ├── colors.css            escalas primitivas e aliases semânticos
│   ├── typography.css        famílias, tamanhos, pesos e entrelinhas
│   ├── spacing.css           escala espacial
│   ├── radii.css             raios de borda
│   ├── shadows.css           sombras
│   ├── motion.css            durações e easings
│   └── themes/               acentos brasileiros
├── base/                     reset e defaults globais
├── layout/                   container, grid, stack e inline
├── components/               componentes de interface
│   ├── core.css              controles, superfícies e dados
│   ├── overlay.css           camadas temporárias
│   ├── navigation.css        orientação e deslocamento
│   └── feedback.css          retorno de estado
├── utilities/                classes atômicas
└── js/                       comportamento em vanilla JS
```

## Identidade

Brisa parte de uma base neutra quente e de um eixo verde profundo. A referência é gráfica e material, não literal: cartaz de rua, azulejo, tecido, sombra, sol duro, recorte. Mata é o acento padrão; Ipê traz luz; Céu aparece em informação; Urucum e Terra entram como calor e contraste.

O moodboard entra como ritmo, cor e matéria. Não como bandeira aplicada em todo canto.

Espaço não é sobra. É ritmo. Controles ficam eficientes; superfícies ganham respiro; seções usam pausas claras para orientar a leitura.

Cantos arredondados são contidos. Formas circulares aparecem quando têm função: pessoa, estado, contagem, alternância ou progresso.

Temas disponíveis:

```html
<html data-accent="azul">     <!-- azul editorial -->
<html data-accent="cerrado">  <!-- verde seco -->
<html data-accent="ipe">      <!-- luz amarela -->
<html data-accent="terra">    <!-- argila e cerâmica -->
<html data-accent="urucum">   <!-- calor gráfico -->
<html data-accent="roxo">     <!-- acento secundário -->
```

## Tokens

Tokens são a camada de decisão do sistema. Use-os para manter contraste, ritmo e intenção visual sem repetir valores soltos.

```css
:root {
  --bg-page: var(--color-gray-50);
  --bg-surface: var(--color-gray-0);
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --border-default: var(--color-gray-200);
  --interactive-default: var(--color-accent-700);
}
```

Principais famílias:

- `--color-gray-*`, `--color-accent-*`, `--color-success-*`, `--color-warning-*`, `--color-error-*`, `--color-info-*`
- `--color-areia-*`, `--color-mata-*`, `--color-terra-*`, `--color-ipe-500`, `--color-urucum-500`, `--color-ceu-500`
- `--bg-*`, `--text-*`, `--border-*`, `--interactive-*`, `--feedback-*`
- `--font-*`, `--text-*`, `--weight-*`, `--leading-*`, `--tracking-*`
- `--space-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--ease-*`

## Dark Mode

Brisa acompanha `prefers-color-scheme`. Quando a interface precisar decidir por conta própria, use `data-theme` no `html`.

```html
<html data-theme="light">
<html data-theme="dark">
```

Tema e acento podem trabalhar juntos:

```html
<html data-theme="dark" data-accent="cerrado">
```

## Cascade Layers

As layers deixam claro o que é fundação e o que é aplicação. A ordem vai do mais estrutural ao mais próximo do uso.

```css
@layer brisa-tokens, brisa-reset, brisa-base, brisa-layout, brisa-components, brisa-utilities;
```

CSS escrito pela aplicação fora de `@layer` vence o sistema sem `!important`.

```css
.btn--solid {
  border-radius: var(--radius-full);
}
```

## Componentes

Os componentes cobrem padrões comuns sem carregar uma assinatura visual pesada. A intenção é resolver o básico com consistência e deixar a interface respirar.

- Button: `.btn`, `.btn--solid`, `.btn--outline`, `.btn--ghost`, `.btn--danger`, `.btn--icon`
- Forms: `.field`, `.input`, `.textarea`, `.select`, `.checkbox`, `.radio`, `.switch`
- Card: `.card`, `.card__header`, `.card__body`, `.card__footer`
- Feedback: `.badge`, `.alert`, `.toast`, `.spinner`, `.progress`, `.skeleton`
- Overlays: `.modal`, `.drawer`, `.dropdown`, `.tooltip`, `.popover`
- Navegação: `.navbar`, `.sidebar`, `.tabs`, `.pagination`
- Dados e pessoas: `.table`, `.avatar`, `.avatar-group`

## Layout

Layout em Brisa organiza fluxo antes de decorar superfície. `container`, `grid`, `stack` e `inline` resolvem alinhamento, largura e ritmo entre elementos.

```html
<main class="container container--lg">
  <section class="stack stack--gap-6">
    <div class="grid grid--cols-12 grid--gap-4">
      <article class="col-span-8">...</article>
      <aside class="col-span-4">...</aside>
    </div>
  </section>
</main>
```

## JavaScript

A camada JS é opcional. Ela cuida de comportamento: foco, teclado, dropdowns, tabs, modais, drawers, navbar e toasts.

```html
<script type="module" src="js/brisa.js"></script>
```

```js
Brisa.toast.success('Salvo com sucesso!');
Brisa.toast.error('Não foi possível salvar.');
Brisa.modal.open('confirmar-exclusao');
Brisa.init(container);
```

`Brisa.init()` roda no carregamento e em nós adicionados ao `document.body`.

## Acessibilidade

Brisa oferece foco visível, navegação por teclado, suporte a `prefers-reduced-motion`, estados semânticos e padrões ARIA nos comportamentos JS. A aplicação continua responsável por bons rótulos, textos claros e HTML semântico.

## Suporte

Brisa usa CSS com suporte amplo em navegadores atuais: custom properties, cascade layers, `:focus-visible`, `:has()` em alguns aprimoramentos e `dialog` nativo.
