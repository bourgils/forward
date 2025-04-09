# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

---

## [0.1.0] - Initial Release

### Added

- `fwd init`: Auto-detect pipe and package manager
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

- Fixed a crash when running `fwd show` in a non-initialized project (before `fwd init`)
