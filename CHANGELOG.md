# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.16](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.15...resume-generator-v0.2.16) (2025-09-04)

### Bug Fixes

- remove proxy logic and update routing for server ([4d31271](https://github.com/catpaladin/resume-generator/commit/4d312714750961d8427d50b8331138a9e8f9f830))

## [0.2.15](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.14...resume-generator-v0.2.15) (2025-09-04)

### Bug Fixes

- electron app needed updates to proxy api calls with sirv ([74ea2b6](https://github.com/catpaladin/resume-generator/commit/74ea2b66130d51eb7183986a3e86bcf26b2e9564))
- replace next serve with sirv for start script ([e43dd82](https://github.com/catpaladin/resume-generator/commit/e43dd821fa3f2b27ad14775e34bc386d8d7fc869))
- start script was not working with standalone sirv ([663533c](https://github.com/catpaladin/resume-generator/commit/663533c5b951a269004f4be0e2c0de9e536a7d49))

## [0.2.14](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.13...resume-generator-v0.2.14) (2025-08-30)

### Features

- replace serve with sirv to address dependency vulns ([f6c90df](https://github.com/catpaladin/resume-generator/commit/f6c90df9f596d66ac872a49991ec9ee91c876bbf))

## [0.2.13](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.12...resume-generator-v0.2.13) (2025-08-23)

### Features

- ai parsing for docx imports ([f51b046](https://github.com/catpaladin/resume-generator/commit/f51b0467b00fb1b2a7362acb20a2fa5cb3adf351))
- ai parsing for import and disable other ai features until ready ([ef8bed2](https://github.com/catpaladin/resume-generator/commit/ef8bed259c4c521e8d740c02a7f9901f3d0e9e32))
- refactor ai settings for additional ai features ([3c9cf94](https://github.com/catpaladin/resume-generator/commit/3c9cf946992a0f72d85a1bad7471550723b2f552))

## [0.2.12](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.11...resume-generator-v0.2.12) (2025-08-19)

### Bug Fixes

- issue with electron builder for windows ([db298a3](https://github.com/catpaladin/resume-generator/commit/db298a3a98d2a087eab6419e507fdcdc0ea34ed8))

## [0.2.11](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.10...resume-generator-v0.2.11) (2025-08-19)

### Features

- enhance docx parser for better matching ([b9bb339](https://github.com/catpaladin/resume-generator/commit/b9bb3399e14270b5761f3444afcdcf5e2d66ed60))

### Bug Fixes

- address signing issues with windows electron build ([af38548](https://github.com/catpaladin/resume-generator/commit/af38548e17513b81e6dd97da9b6ed45c8811e8ce))

## [0.2.10](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.9...resume-generator-v0.2.10) (2025-08-18)

### Features

- add import docx that tries to parse the resume ([d11e23c](https://github.com/catpaladin/resume-generator/commit/d11e23c9b26bd10c6658964a7cdff7c1e5eef5ca))

## [0.2.9](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.8...resume-generator-v0.2.9) (2025-08-12)

### Bug Fixes

- address electron-builder issues with macos along with weird settings ([e133aed](https://github.com/catpaladin/resume-generator/commit/e133aed78869de21b7f799f7ed25a72edb53430d))

## [0.2.8](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.7...resume-generator-v0.2.8) (2025-08-11)

### Bug Fixes

- forgot to remove sign field ([cea4217](https://github.com/catpaladin/resume-generator/commit/cea421703739db5064845c7b98bfde3aa1257748))

## [0.2.7](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.6...resume-generator-v0.2.7) (2025-08-11)

### Features

- create github pages ([1063951](https://github.com/catpaladin/resume-generator/commit/10639519955080a4acf047d1649609e420a90584))
- update packages and fix hydration issues ([39e1b36](https://github.com/catpaladin/resume-generator/commit/39e1b364a7d80851b1dfacf3d0e4a03f0e5ea242))

### Bug Fixes

- electron-builder tweaks and instructions ([3afeab2](https://github.com/catpaladin/resume-generator/commit/3afeab224199218b39a1d8bb91054135b58db8c3))
- gha workflow trigger for pages ([891ba12](https://github.com/catpaladin/resume-generator/commit/891ba12b2b099232405ca7da0948c9b3019eed75))

## [0.2.6](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.5...resume-generator-v0.2.6) (2025-08-10)

### Bug Fixes

- api router fixes for electron ([7354b04](https://github.com/catpaladin/resume-generator/commit/7354b04b156c8e274d86b94aaa61302a2aebeffd))

## [0.2.5](https://github.com/catpaladin/resume-generator/compare/resume-generator-v0.2.4...resume-generator-v0.2.5) (2025-08-10)

### Features

- added app:// protocol as fallback and fmt+lint ([499eb5f](https://github.com/catpaladin/resume-generator/commit/499eb5f90b835f0343e4228a115c5326060219c1))

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
