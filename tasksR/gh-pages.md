# GitHub Pages
## Activar Source
Settings → Pages → Source: **GitHub Actions** (no branch).
## Alternativa via gh
gh api -X PUT repos/Mare1225/NestLink/pages -f source.branch=gh-pages -f source.path=/  # si aplica
# Para actions source:
gh api repos/Mare1225/NestLink/pages -X PUT -f build_type=workflow
