# Codexia & Ink marketing website

This is a dependency-free static site, published by Netlify from `website/`.

## Local preview

From the repository root, run:

```sh
cd website
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Netlify

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and select this repository.
3. Netlify reads `netlify.toml`: there is no build command and the publish directory is `website`.
4. After the first deploy, add `codexia.ink` under **Domain management** and follow Netlify's DNS instructions in Namecheap.

The invitation form uses Netlify Forms. Form submissions become available in the Netlify dashboard after the first deployment.

## Before launch

- Replace the "coming soon" store links with real App Store and Google Play URLs.
- Create the `hello@`, `support@`, and `privacy@codexia.ink` mailboxes or forwarding aliases.
- Have the privacy policy reviewed for the services and jurisdictions used at launch.
