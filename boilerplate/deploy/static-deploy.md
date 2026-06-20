# Static Deploy Notes

This project no longer depends on AutoCode for deployment.

## Build

```bash
npm run build
```

If you already know the production domain, set `SITE_URL` so `sitemap.xml` contains the final canonical host:

```bash
SITE_URL=https://your-domain.com npm run build
```

The static site is generated into:

```text
dist/
```

## Deployment Target

Use any static host that can serve the `dist/` folder:

- Cloudflare Pages
- Netlify
- Vercel static output
- GitHub Pages
- Any nginx/static file server

## Public Recovery Rules

- Do not generate old-domain 301 redirects.
- Do not claim ownership of `interviewbits.com`.
- Do not add old-brand copyright or official continuation language.
- Keep archive evidence notes visible on article pages.
