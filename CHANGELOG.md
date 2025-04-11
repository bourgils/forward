# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

---

## [0.1.0] - Initial Release

### Added

- `fwd env init`: Auto-detect pipe and package manager
- `fwd show`: Show current session info
- `fwd run [script]`: run commands in temp environment
- `fwd exec [cli] [cmd [args...]]`: Run any shell command inside isolated env
- `fwd use [pipe]`: Manually set the pipe (runtime) for the current project
- `fwd reset`: Clean current session
- `fwd [cmd] [args...]`: Pass through command to the pipe
- 📁 Sessions are isolated per-project with hashed paths
- 📦 Symlink strategy to support hot reload
- 💾 Disk usage tracker + cleanup summary
- 📦 Linter, Prettier, EditorConfig setup
- 📄 README + roadmap

## [0.1.1]

### Added

- `fwd add`: Add package to the project
- `fwd remove`: Remove package from the project

### Fixed

- Fixed a crash when running `fwd show` in a non-initialized project (before `fwd env init`)

## [0.2.1]

### Added

- `fwd env init`: New environment initialization command
- `fwd env show`: Display current environment configuration
- `fwd env use`: Set specific environment configuration
- `fwd env reset`: Reset environment to default state
- `fwd doctor`: New command to check system compatibility
- Runtime environment checks for better compatibility
- Version management system

### Changed

- Refactored CLI commands structure under `env` namespace
- Improved environment variable handling
- Enhanced project architecture with better separation of concerns
- Removed session-based management in favor of environment-based approach

### Removed

- `fwd init`: Replaced by `fwd env init`
- `fwd show`: Replaced by `fwd env show`
- `fwd use`: Replaced by `fwd env use`
- `fwd reset`: Replaced by `fwd env reset`
- Session management system

## [0.2.2]

### Enhanced

- Made all command arguments optional for better UX
- Added interactive script selection in `run` command
- Improved error messages and error handling across commands
- Enhanced visual feedback with chalk styling
- Expanded `doctor` command with more detailed diagnostics

### Fixed

- Argument handling in multiple commands
- Better handling of edge cases when no arguments provided

## [0.3.0]

### Changed

- Renamed `fwd env use` to `fwd env set` for better clarity
- Improved environment initialization feedback with detailed progress messages
- Enhanced error messages and user guidance
- Refactored constants into dedicated files for better maintainability
- Updated logger icons for better visual consistency

### Fixed

- Improved environment reset process with better file handling
- Enhanced runtime checks with clearer error messages
- Fixed typos in user-facing messages

## [0.4.0]

### Added

- `fwd https`: New command for secure local development with HTTPS
  - Automatic SSL certificate generation and management
  - Local domain mapping with `.dev` TLD support
  - Custom domain support via `--domain` option
  - Hot reload support for Vite and Create React App
- New core modules for HTTPS support:
  - Certificate management (`src/lib/certs.js`)
  - Host file management (`src/lib/hosts.js`)
  - Port detection (`src/lib/port-watcher.js`)
  - HTTPS proxy server (`src/lib/proxy.js`)

### Changed

- Enhanced project documentation with HTTPS usage guidelines
- Improved README with clearer project description and limitations
- Updated command aliases for better consistency

### Fixed

- DNS cache flushing on macOS for proper domain resolution
- Certificate trust management for macOS keychain

---
