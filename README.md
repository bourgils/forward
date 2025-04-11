# ⚡️ forward (CLI: `fwd`)

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

---

## 🔧 CLI Commands

| Command                          | Alias        | Description                                          |
| -------------------------------- | ------------ | ---------------------------------------------------- |
| `fwd env init`                   | `i`          | Initialize environment and detect pipe & pkg manager |
| `fwd env show`                   | `s`          | Show current environment configuration               |
| `fwd env set`                    |              | Set specific environment configuration               |
| `fwd env reset`                  | `r`          | Reset environment to default state                   |
| `fwd doctor`                     | `d`          | Check system compatibility and configuration         |
| `fwd run [script]`               |              | Run npm script from package.json                     |
| `fwd exec [cli] [cmd [args...]]` |              | Execute any raw command in session                   |
| `fwd add`                        | `install`    | Add a package                                        |
| `fwd remove`                     | ``uninstall` | Remove a package                                     |
| `fwd https [options]`            | `h`          | Run with HTTPS proxy (--script, --domain options)    |

---

## 📁 How it works

- Creates an isolated environment for your project
- Manages dependencies in a temporary location
- Provides runtime checks for compatibility
- Launches your pipe (vite, next, etc.) with full hot reload support
- Cleans everything after Ctrl+C

---

## 🧪 Supported pipes (auto-detected)

- vite
- next
- nuxt
- react-scripts
- bun
- astro

> Environment not detected? Just use: `fwd env set`

## 🔒 HTTPS Support

> ⚠️ **Important**:
>
> - The HTTPS command requires `sudo` privileges: `sudo fwd https`
> - During first run, the SSL certificate will be added to your keychain and macOS may prompt for your password
> - HTTPS support is fully tested on macOS and implemented (untested) on Linux

The `https` command provides secure local development with automatic SSL certificates and domain mapping:

```bash
# Run dev script with default .dev domain (e.g., my-project.dev)
sudo fwd https --script=dev

# Run dev script with custom domain
sudo fwd https --script=dev --domain=awesome-domain.com
```

### Hot Reload Support

Hot reload is fully supported with the following configurations:

- **Vite**: Works out of the box
- **Create React App**: Requires a `.env` file with `WDS_SOCKET_PORT=443` for hot reload support
- **Others (Next.js, etc.)**: Support may vary depending on the framework's configuration

> Note: The HTTPS proxy automatically maps your project to a `.dev` domain (e.g., `357289.my-project.dev`)

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
npm install
npm link
```

Then go into any project and run:

```
fwd env init
fwd dev or fwd start
```

---

## 🫶 Author

Made with ❤️ by @bourgils

---

## 🗺️🚧 Roadmap

### 🧠 Planned Features

- 🧹 Code cleanup & architecture: refactor into classes/services for better structure — _coming soon_
- ⚡️ Remote execution UX: support `fwd dist [github_repo]` to fetch & run a repo temporarily — _coming soon_
