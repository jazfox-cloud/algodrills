# Deprecated AutoCode Deploy Prompt

This project no longer depends on AutoCode.

Use the built-in static deploy notes instead:

```text
boilerplate/deploy/static-deploy.md
```

Build the site with:

```bash
npm run build
```

The generated static site is written to:

```text
dist/
```

Public recovery rule: do not create old-domain 301 redirects unless old-domain control is explicitly confirmed.
