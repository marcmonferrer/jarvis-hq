# Deployment Procedure

1. Run the secret scan and build locally.
2. Run the artifact privacy and release validators.
3. Review the exact contents of `_site` against `deploy-allowlist.txt`.
4. Commit only the reviewed public-source candidate.
5. Enable GitHub Pages with **GitHub Actions** as the source.
6. Enable GitHub secret scanning and push protection in repository settings.
7. Trigger the workflow and review the `github-pages` environment deployment.
8. Verify the root, three legacy redirects, 404 page and all runtime assets on the production origin.

The Pages workflow uses separate build and deployment permissions. The build job can only read repository contents. The deploy job receives only `pages: write` and `id-token: write`.
