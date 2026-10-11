# Preview deployments

Some changes may need a temporary deployment in order to test (eg on different devices). Add the `needs:preview` label to the pull request to trigger an ephemeral deployment be generated. Subsequent pushes will automatically trigger a rebuild for the same ephemeral deployment. The deployment will be torn down when the pull request is closed (or merged).

# Releases

Releases are managed via GitHub Releases. A release marked "latest" will automatically trigger a new production build and publish it to GitHub Pages (and thus available on `MeCards.app`).

Prior to creating a release, ensure `version` in `package.json` has been updated.

Name the release unprefixed with the SemVer number (eg `1.0.0`, **not** `v1.0.0`); name the tag the same.

Remove irrelevant items from the auto-generated change list (eg dev-dep and GHA dep updates, but **DO** retain prod-dep updates).
