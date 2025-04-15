# 💻 forward (CLI: `fwd`)

> Isolated, throwaway runtime for modern frontend projects
> No `node_modules`, no pollution — just run, dev, and it disappears.

> ⚠️ **Important**: Forward (fwd) is not a package manager. It's a command forwarding tool that creates temporary environments with isolated `node_modules` for your commands. It doesn't manage your project's dependencies permanently.

---

## ✨ Features

- 🧼 **Run any project without installing deps locally**
- 🧪 Use `vite`, `react-scripts`, `next`, etc. with **hot reload**
- 🔐 Dependencies are installed in a **temp session**, never your project
- 🗑️ When the server stops, everything is cleaned
- 🧙 Supports `install`, `uninstall`, and custom commands
- 🌐 Run remote repositories directly with `--repository`
- 🔒 HTTPS support with automatic SSL certificates
- 📊 Inspect and manage node_modules with modules commands

---

## 🚀 Quick Start

```
npm install -g @bourgils/forward
```

### Inside a project with a `package.json`

```
fwd env init      # Initialize environment and detect pipe & package manager
fwd env show      # Show current environment configuration
fwd env set       # Set specific environment configuration
fwd env reset     # Reset environment to default state
fwd doctor        # Check system compatibility and configuration
fwd dev           # → vite dev or next dev
fwd run build     # → npm run build (in temp env)
fwd exec echo Hello
fwd add react react-dom
fwd remove react
```

### Run remote repositories

```
fwd run dev --repository=https://github.com/user/repo
fwd run dev --repository=https://github.com/user/repo --keep-clone  # Keep the clone after execution
```

### Run with HTTPS

```
sudo fwd run dev --https
sudo fwd run dev --https --domain=custom-domain.com
```

### Manage node_modules

```
fwd modules inspect . --also dist,build,.*cache  # Show node_modules content and size
fwd modules prune    # Clean up unused dependencies
```

---

## 🔧 CLI Commands

| Command                      | Alias       | Description                                                 |
| ---------------------------- | ----------- | ----------------------------------------------------------- |
| `fwd env init`               | `i`         | Initialize environment and detect pipe & pkg manager        |
| `fwd env show`               | `s`         | Show current environment configuration                      |
| `fwd env set`                |             | Set specific environment configuration                      |
| `fwd env reset`              | `r`         | Reset environment to default state                          |
| `fwd doctor`                 | `d`         | Check system compatibility and configuration                |
| `fwd run [script]`           |             | Run npm script from package.json                            |
| `fwd exec [cmd] [args...]`   |             | Execute any raw command in session                          |
| `fwd add [package]`          | `install`   | Add a package                                               |
| `fwd remove [package]`       | `uninstall` | Remove a package                                            |
| `fwd modules inspect [root]` |             | Inspect node_modules content and size from [root] directory |
| `fwd modules prune [root]`   |             | Clean up unused dependencies from [root] directory          |

### `run` Command Options

| Option              | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `--repository`      | Run from a remote repository (auto-clone & cleanup)             |
| `-k, --keep-clone`  | Keep the cloned repository after execution, in current location |
| `-h, --https`       | Enable HTTPS with automatic trsuted SSL certificates            |
| `-d, --domain`      | Set custom domain for HTTPS (default: .dev)                     |
| `-t, --target-port` | Choose target port to forward traffic to (only with --https)    |

### `modules inspect` Command Options

| Option               | Description                                                                        |
| -------------------- | ---------------------------------------------------------------------------------- |
| `-i, --ignore-paths` | Add paths to ignore during inspection                                              |
| `-a, --also`         | Add some files or folders to looking for during inspection (eg, --also build,dist) |
| `--all`              | Remove system paths and hidden files from default ignored paths                    |

---

### `modules prune` Command Options

| Option               | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `-i, --ignore-paths` | Add paths to ignore for prune (eg, --ignore-paths ~/me,~/prod ) |
| `-a, --also`         | Add some files or folders to to prune (eg, --also build,dist)   |
| `-y, --yes`          | Prevent prompt before prune files                               |
| `--dry-run`          | Dry run the command                                             |
| `--interactive`      | Allow path selection for prune                                  |

---

> ⚠️ **Important**:
> Please note that HTTPS support may require using the --target-port option in cases where concurrent processes are launched at startup and the detected port is not the target local server port. Additionally, hot-reload support with HTTPS may require configuration to forward WebSocket connections to the final server (e.g., for create-react-app (CRA), WDS_SOCKET_PORT=443 must be set in .env).

## 📁 How it works

- Creates an isolated environment for your project
- Manages dependencies in a temporary location
- Provides runtime checks for compatibility
- Launches your scripts as you usually do or any raw command
- Cleans everything after Ctrl+C
- Supports remote repository execution with automatic cleanup, HTTPS proxy for local development and

---

> Environment not detected? Just use: `fwd env set`

## 🔒 HTTPS Support

> ⚠️ **Important**:
>
> - The `--https` option requires `sudo` privileges: `sudo fwd run dev --https`
> - During first run, the SSL certificate will be added to your keychain and macOS may prompt for your password
> - HTTPS support is fully tested on macOS and implemented (untested) on Linux

Run any command with HTTPS support:

```bash
# Run dev script with default .dev domain (e.g., 357289.my-project.dev)
sudo fwd run dev --https

# Run dev script with custom domain
sudo fwd run dev --https --domain=awesome-app.dev
```

> Mapping a .com, .net, .io, etc., which is probably a real domain, generates a warning. You can continue, but your browser's cache may cause problems.

### Hot Reload Support

Hot reload is fully supported with the following configurations:

- **Vite**: Works out of the box
- **Create React App**: Requires a `.env` file with `WDS_SOCKET_PORT=443` for hot reload support
- **Others (Next.js, etc.)**: Support may vary depending on the framework's configuration

> Note: The HTTPS proxy defaults map your project to a `.dev` domain (e.g., `357289.my-project.dev`)

---

## 💡 Why?

Because `node_modules` folders are huge.
And every time you clone a project, you run `npm install` and forget to clean.
With fwd, you just run it and forget it — nothing is written in your project unless you want it.

---

## 🔄 Dev mode

Want to test locally?

```
git clone https://github.com/bourgils/forward
cd
cp .env.local .env # For CRA HTTPS support
npm install
npm link
```

Then go into any project and run:

```
fwd env init
fwd run dev or fwd run start
```

---

## 🫶 Author

Made with ❤️ by @bourgils

---

## 🗺️ Roadmap

The roadmap is currently open for suggestions! Here are some planned improvements:

### 🧠 Planned Features

- 🔍 Add ESLint plugin for consistent code style
- 🔒 Add pre-commit hooks for code validation
- _More coming soon..._

Feel free to:

- Open an issue with your feature request
- Join the discussion about the future of Forward
- Share your use cases and needs

Previous roadmap items completed in v0.5.0:

- 🧹 Code cleanup & architecture: refactor into classes/services for better structure
- 🌐 Remote execution UX: support for running remote repositories
