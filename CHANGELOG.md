# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.6](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.5...resume-generator-v0.2.6) (2025-08-10)


### Bug Fixes

* api router fixes for electron ([7354b04](https://github.com/catpaladin/resume-generator/commit/7354b04b156c8e274d86b94aaa61302a2aebeffd))

## [0.2.5](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.4...resume-generator-v0.2.5) (2025-08-10)


### Features

* added app:// protocol as fallback and fmt+lint ([499eb5f](https://github.com/catpaladin/resume-generator/commit/499eb5f90b835f0343e4228a115c5326060219c1))

## [0.2.4](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.3...resume-generator-v0.2.4) (2025-08-10)

### Bug Fixes

- update builds to progress to next step ([8812d87](https://github.com/catpaladin/resume-generator/commit/8812d8701e8889f905da5463b34d0830ffad0063))

## [0.2.3](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.2...resume-generator-v0.2.3) (2025-08-10)

### Bug Fixes

- linux and windows build updates ([12d24b8](https://github.com/catpaladin/resume-generator/commit/12d24b83f5f2939bc8fe1655ff2ca9ab7c48179e))

## [0.2.2](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.1...resume-generator-v0.2.2) (2025-08-10)

### Bug Fixes

- continue on error to prevent builds from all dying ([aa6cf99](https://github.com/catpaladin/resume-generator/commit/aa6cf99772104a2ea6311ca4b8f0fc071903475c))

## [0.2.1](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.0...resume-generator-v0.2.1) (2025-08-10)

### Features

- add AI features for experience ([b4508cc](https://github.com/catpaladin/resume-generator/commit/b4508ccde8a324ab4e80bdcc1cf4001be1803fbd))
- add release pipeline ([8ff78aa](https://github.com/catpaladin/resume-generator/commit/8ff78aa30e18b60543b7fd286fbd9195d1e0c842))
- add system prompts, sanitization, and UX improvements to experience bullets ([5df12c1](https://github.com/catpaladin/resume-generator/commit/5df12c10ee2f5a77b0931cac2fdb49ebcd9f6e98))
- added sections to get to resume sections faster in preview ([ca58c97](https://github.com/catpaladin/resume-generator/commit/ca58c979ced982254388d475f8a0fb6bee083c30))
- all form components consistent ([30697ba](https://github.com/catpaladin/resume-generator/commit/30697ba2be3dc5779398d8b450112c98ea00dd22))
- dynamic size the text area of the experience bullet forms ([477546c](https://github.com/catpaladin/resume-generator/commit/477546cf5890c41a7b0200da517efd1e03512878))
- electron functionality for GUI support ([57afacd](https://github.com/catpaladin/resume-generator/commit/57afacdaa78c575f52e407ce2449bd5d3064e89e))
- enhance input cards and themes ([3b311bc](https://github.com/catpaladin/resume-generator/commit/3b311bc5403d69d690cc58e452255e6ac1c61faf))
- improve theme responsiveness and preview ([9553194](https://github.com/catpaladin/resume-generator/commit/95531940e8fb7c6edb65ee3a2eb2b7e869599b2f))
- local storage and theme changes ([027c151](https://github.com/catpaladin/resume-generator/commit/027c151166879853046e162697b5660843bf08a5))
- move preview and add theming for dark mode ([1a18bf1](https://github.com/catpaladin/resume-generator/commit/1a18bf1b0e6b8f6e3e73d02f56f79c353bebd418))
- refactor state to use zustand ([0b3e913](https://github.com/catpaladin/resume-generator/commit/0b3e91361d32fe94a03ade76eaa047bd46d79416))
- skill groupings ([4e30c74](https://github.com/catpaladin/resume-generator/commit/4e30c748d2c14bd67fa4512b14b02af4100d60b6))
- test components and increase coverage ([c7a0de4](https://github.com/catpaladin/resume-generator/commit/c7a0de4dcc85c84cc6a85b6eb22084987e722dd0))
- ugrade some versions and fix some warnings ([14d5932](https://github.com/catpaladin/resume-generator/commit/14d5932373d2db3e35dcc92b8d342f9a51f2dfe5))

### Bug Fixes

- export pdf in light mode to fix dark mode issues ([4af678b](https://github.com/catpaladin/resume-generator/commit/4af678b2209bd0f285d0cacddbac67f949af7e1a))
- fix some nextjs runtime errors ([43b050d](https://github.com/catpaladin/resume-generator/commit/43b050d819dbba50aeb472997c7ab39ce2e1e825))
- pdf issues ([f0dbe2d](https://github.com/catpaladin/resume-generator/commit/f0dbe2d72efbd942a35951183ebdf664084867a8))
- release please context on files ([d41cbd8](https://github.com/catpaladin/resume-generator/commit/d41cbd8a752796f24fc26178770a770cbaabb296))
- release please fixes ([c2484da](https://github.com/catpaladin/resume-generator/commit/c2484dad124338675a7e8c8852e760d5db7501f0))
- release please pipeline fixes ([6621383](https://github.com/catpaladin/resume-generator/commit/6621383b46057daf817cd176a9b9f65e2adbaa6f))

### Code Refactoring

- cleanup and refactors ([8d191f3](https://github.com/catpaladin/resume-generator/commit/8d191f3b388117620514a882972deb3eff0f9636))
- lint, type fixes, and formatting ([0b8dbc3](https://github.com/catpaladin/resume-generator/commit/0b8dbc3f5adeb4d7ad8ac99bd0814bd530c2f47a))

## [Unreleased]

### Features

- Initial release of Resume Generator
- Cross-platform desktop application with Electron
- Real-time resume preview and PDF export
- AI-powered content enhancement
- Beautiful Tailwind CSS interface
- Zustand state management with localStorage persistence
- Comprehensive testing suite

### Build System

- Added automated release workflow with release-please
- Configured conventional commits for automatic changelog generation
- Set up cross-platform builds for Windows, macOS, and Linux
