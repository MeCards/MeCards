# Preview deployments

Some changes may need a temporary deployment in order to test (eg on different devices). Add the `needs:preview` label to the pull request to generate an ephemeral deployment. Subsequent pushes to the PR's branch will automatically trigger a rebuild for the same ephemeral deployment. The deployment will be torn down when the PR is merged (or otherwise closed).

# Releases

Releases are managed via GitHub Releases. A release marked "latest" will automatically trigger a new production build and publish it to GitHub Pages (and thus available on `MeCards.app`).

Name the release _unprefixed_ with the SemVer value (eg `1.0.0`, **not** `v1.0.0`); name the tag the same. The Release workflow automatically sets `package.json` based on the release; **do not update it manually**.

Remove irrelevant items from the auto-generated change list (eg remove dev-dep and GHA dep updates, but **DO** retain prod-dep updates).
