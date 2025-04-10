# 🔁 forward (CLI: `fwd`)

> Isolated, throwaway runtime for modern frontend projects
> No `node_modules`, no pollution — just run, dev, and it disappears.

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
fwd env use       # Set specific environment configuration
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

| Command                          | Alias | Description                                          |
| -------------------------------- | ----- | ---------------------------------------------------- |
| `fwd env init`                   |       | Initialize environment and detect pipe & pkg manager |
| `fwd env show`                   |       | Show current environment configuration               |
| `fwd env use`                    |       | Set specific environment configuration               |
| `fwd env reset`                  |       | Reset environment to default state                   |
| `fwd doctor`                     |       | Check system compatibility and configuration         |
| `fwd run [script]`               |       | Run npm script from package.json                     |
| `fwd exec [cli] [cmd [args...]]` |       | Execute any raw command in session                   |
| `fwd add`                        |       | Add a package                                        |
| `fwd remove`                     |       | Remove a package                                     |

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

> Environment not detected? Just use: `fwd env use`

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
