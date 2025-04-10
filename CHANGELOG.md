# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

---

## [0.1.0] - Initial Release

### Added

- `fwd env init`: Auto-detect pipe and package manager
- `fwd show`: Show current session info
- `fwd run <script>`: run commands in temp environment
- `fwd exec <cli> [cmd [args...]]`: Run any shell command inside isolated env
- `fwd use <pipe>`: Manually set the pipe (runtime) for the current project
- `fwd reset`: Clean current session
- `fwd <cmd> [args...]`: Pass through command to the pipe
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

## [0.2.0]

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

- `fwd env init`: Replaced by `fwd env init`
- `fwd show`: Replaced by `fwd env show`
- `fwd use`: Replaced by `fwd env use`
- `fwd reset`: Replaced by `fwd env reset`
- Session management system
