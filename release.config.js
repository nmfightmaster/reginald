// release.config.js
/** Semantic Release configuration for repo-level GitHub releases (no npm publish). */
module.exports = {
  // Only release from main
  branches: ['main'],

  // Plugin pipeline: analyze → notes → changelog → bump pkg.json → commit files → GitHub Release
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        pkgRoot: '.', // bump the root package.json version
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
