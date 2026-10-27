# Pre-build MDX Compiler

Compiles all `.mdx` files in `content/posts/` and `content/authors/` into standalone ES module `.js` files at build time, eliminating the need for runtime Blob URL compilation or `unsafe-eval` in the Content Security Policy.

## Why This Is Required

The production CSP **does not** include `'unsafe-eval'` in `script-src` for security reasons. This means runtime MDX compilation (which uses `new Function()`) will **fail silently in production** — articles will show an error message instead of rendering.

This script pre-compiles all MDX content at build time so the browser loads pre-built JavaScript modules directly — no `eval`, no Blob URLs, no CSP violations.

## Usage

```bash
# Run standalone (compiles MDX files only, does not build the site)
pnpm precompile

# Or run as part of the full build (precompile runs automatically before vite build)
pnpm build

# Direct invocation
npx tsx scripts/precompile-mdx/script.ts
```

### Integration with `pnpm build`

The `precompile` script is wired into the build pipeline. When you run `pnpm build`, it:

1. Runs `precompile-mdx` → generates `src/lib/content/__compiled__/{posts|authors}/{slug}.js`
2. Runs `vite build` → bundles everything into static assets

If you deploy without running `pnpm build` (e.g., copying `src/` directly), you **must** run `pnpm precompile` first or articles will not render.

## How It Works

1. Discovers all `.mdx` and `.md` files in `content/posts/` and `content/authors/`
2. Strips YAML frontmatter using `gray-matter`
3. Compiles the MDX body to a JavaScript module string using `@mdx-js/mdx`
4. Writes the compiled module to `src/lib/content/__compiled__/{posts|authors}/{slug}.js`
5. At runtime, the content source imports these pre-compiled modules instead of raw strings

## Benefits

- **Eliminates `'unsafe-eval'` from production CSP** — no runtime `eval` needed
- **Eliminates `blob:` from production CSP** — no runtime Blob URL creation needed
- **Faster page loads** — MDX is already compiled, zero client-side compilation latency
- **Better SEO** — content is available immediately for crawlers
- **Lower memory usage** — no Blob URL cache management needed
- **Maximum security** — MDX is trusted, pre-compiled content; no arbitrary code execution at runtime

## Troubleshooting

### "This article was not pre-compiled" error in production

This means the pre-compiled modules were not generated before deployment. Fix:

```bash
pnpm precompile   # or pnpm build
```

Then redeploy. The compiled files are generated under `src/lib/content/__compiled__/`.

### Articles work in dev but not in production

Development mode allows runtime MDX compilation (dev CSP includes `blob:` and `unsafe-inline`). Production does not. Always run `pnpm build` before deploying.

## Verification

```bash
pnpm precompile && pnpm typecheck
```

Check that compiled files exist:

```bash
ls src/lib/content/__compiled__/posts/
```
