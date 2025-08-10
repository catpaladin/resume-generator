# Release Process

This repository uses **release-please** for automated releases with conventional commits and dynamic changelogs.

## How Releases Work

1. **Conventional Commits**: Use conventional commit messages to trigger automatic releases
2. **Dynamic Changelogs**: Changes are automatically categorized and added to CHANGELOG.md
3. **Automated Versioning**: Versions are bumped based on commit types (feat, fix, etc.)
4. **Cross-Platform Builds**: Electron apps are built for Windows, macOS, and Linux

## Commit Message Format

Use [conventional commits](https://www.conventionalcommits.org/) for automatic changelog generation:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: New features (triggers minor version bump)
- `fix`: Bug fixes (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting changes

### Examples:
```bash
git commit -m "feat: add AI-powered resume suggestions"
git commit -m "fix: resolve PDF export formatting issue"
git commit -m "docs: update installation instructions"
git commit -m "feat(ui): implement dark mode toggle"
```

## Release Process

1. **Make Changes**: Develop features and fixes using conventional commits
2. **Push to Main**: Push commits to the `main` branch
3. **Automatic PR**: Release-please creates a "release PR" with:
   - Updated CHANGELOG.md
   - Version bump in package.json
   - Generated release notes
4. **Merge Release PR**: When you merge the PR, it:
   - Creates a GitHub release
   - Triggers Electron builds
   - Attaches installers to the release

## What Gets Built

When a release is created, the workflow automatically builds:
- **Windows**: `.exe` installer (NSIS) for x64
- **macOS**: `.dmg` disk image (Intel + Apple Silicon)
- **Linux**: `.AppImage` portable app for x64

## Changelog Categories

Commits are automatically categorized in the changelog:
- **Features**: New functionality
- **Bug Fixes**: Bug fixes and patches
- **Documentation**: Documentation updates
- **Performance Improvements**: Performance enhancements
- **Code Refactoring**: Code restructuring
- **Tests**: Test additions and updates
- **Build System**: Build and tooling changes
- **CI**: Continuous integration updates

## Configuration Files

- `.release-please-config.json`: Release-please configuration
- `.release-please-manifest.json`: Version tracking
- `.commitlintrc.json`: Commit message linting rules
- `CHANGELOG.md`: Automatically generated changelog

## Testing

Release-please will only create releases from the `main` branch. Test changes in feature branches before merging to avoid unintended releases.