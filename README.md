# 📱 Support Roster UI

[中文](./README.zh-CN.md) · [Parent workspace](https://github.com/yachi666/support-platform)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?style=flat-square&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5fa04e?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> A modern Vue 3 frontend for the support roster platform, delivering public on-call visibility, authenticated workspace management, and operational tools through a polished single-page application.

**Support Roster UI** is the user-facing web interface for managing and viewing on-call schedules. It provides a public roster viewer, an admin workspace for planning and operations, contact information pages, product release notes, and protected tools—all built with Vue 3, Vite, and Tailwind CSS.

This repository is designed to work as a **Git submodule** within [`support-platform`](https://github.com/yachi666/support-platform), where backend services, automated tests, development scripts, and curated screenshots are centrally coordinated.

---

## ✨ Highlights

- **🎯 Vue 3 Composition API** with `<script setup>` and reusable feature structure
- **⚡ Lightning-fast development** powered by Vite 7 with HMR
- **🎨 Modern styling** using Tailwind CSS 4 with custom design tokens
- **🛣️ Smart routing** via Vue Router 5 with role-based access guards
- **🔒 Access control** enforcing workspace policies on protected pages
- **📦 Modular architecture** with feature-based organization
- **🌐 Internationalization** support via Vue I18n
- **🐳 Production-ready** with Docker + Nginx deployment path
- **📚 Comprehensive specs** maintained in `.specs/` for all features

---

## 🖼️ Screenshots

| Public Viewer | Workspace Overview |
|---|---|
| ![Public roster viewer](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/public-viewer.png) | ![Workspace overview](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-overview.png) |

| Monthly Roster Planner | Validation Center |
|---|---|
| ![Monthly roster planner](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-roster.png) | ![Workspace validation center](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-validation.png) |

---

## 🗺️ Product Surfaces & Routes

| Surface | Route | Access | Purpose |
|---------|-------|--------|---------|
| **Public Viewer** | `/viewer` | Public | Read-only on-call timeline with date picker, timezone selector, and responsive layout |
| **Login** | `/login` | Public | Staff ID authentication and account activation flow |
| **Admin Workspace** | `/workspace/*` | Authenticated + Policy | Complete roster management: overview, monthly planning, staff, shifts, teams, validation, import/export, accounts |
| **Contact Information** | `/contact-information` | Public + Protected | Public viewing and admin management of contact details |
| **Linux Passwords** | `/linux-passwords` | Protected | Operational password vault gated by workspace access policy |
| **Product Updates** | `/product-updates` | Public | User-facing release notes tracking visible product changes |

> **Note:** Navigating to `/workspace` redirects users to the appropriate workspace entry page based on their authenticated permissions and workspace policy.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue 3.5 (Composition API) |
| **Build Tool** | Vite 7 |
| **Router** | Vue Router 5 |
| **State Management** | Vue reactivity + Pinia stores |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix Vue (headless primitives) |
| **Icons** | Lucide Vue Next |
| **Utilities** | clsx, tailwind-merge, class-variance-authority |
| **Date Handling** | date-fns, date-fns-tz |
| **i18n** | Vue I18n |
| **Runtime** | Node.js `^20.19.0 \|\| >=22.12.0` |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** `^20.19.0 || >=22.12.0`
- **npm** (comes with Node.js)
- **Backend API** running at `http://127.0.0.1:8080/api` (see [Backend Dependency](#backend-dependency))

### Installation

```bash
# Clone the repository (if standalone) or init submodules (if from parent workspace)
git submodule update --init --recursive

# Navigate to the UI directory
cd support-roster-ui

# Install dependencies
npm install
```

### Development

```bash
# Start the Vite dev server (default port: 5173)
npm run dev
```

The app will be available at `http://localhost:5173` with hot module replacement enabled.

**Default API Configuration:**
```bash
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

You can override this in `.env.development.local` (not tracked by Git).

### Build & Preview

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The build output will be in the `dist/` directory.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build production-ready static bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format `src/` with Prettier |

---

## 🔧 Environment Variables

| Variable | Purpose | Default (Dev) | Example (Prod) |
|----------|---------|---------------|----------------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://127.0.0.1:8080/api` | `https://supportui.servier/api` |
| `VITE_XMATTERS_URL` | External Systems drawer link for xMatters | `https://www.xmatters.com/` | |
| `VITE_SERVICENOW_URL` | External Systems drawer link for ServiceNow | `https://www.servicenow.com/` | |
| `VITE_MESSAGE_DELIVERY_KB_URL` | Message Delivery Knowledge Base link | `https://learn.microsoft.com/` | |

**Configuration Files:**
- `.env.development` – Development defaults
- `.env.production` – Production defaults
- `.env.development.local` / `.env.production.local` – Local overrides (not committed)

See [Vite's environment variables documentation](https://vite.dev/guide/env-and-mode.html) for more details.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │           Vue 3 SPA (Vite)                │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  /viewer       # Public roster view │ │ │
│  │  │  /login        # Auth & activation  │ │ │
│  │  │  /workspace/*  # Admin workspace    │ │ │
│  │  │  /contact-information/* # Contact flows │ │ │
│  │  │  /linux-passwords       # Protected vault│ │ │
│  │  │  /product-updates       # Release notes  │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │      src/api/ (API Client Layer)    │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
│                       │                         │
│                       ▼                         │
│              HTTP Requests                      │
└─────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   support-roster-server       │
        │   (PostgreSQL backend)        │
        └───────────────────────────────┘
```

**Key Concepts:**
- **Single-page application** with client-side routing
- **API layer** (`src/api/`) abstracts backend communication
- **Route guards** enforce authentication and workspace policies
- **Feature modules** encapsulate domain logic (workspace, contact-info, etc.)
- **Pinia stores** manage cross-component state when reactivity isn't enough

---

## 📂 Project Structure

```text
support-roster-ui/
├── .specs/                          # 📚 Frontend specifications
│   ├── spec.md                      # Main spec navigation
│   ├── architecture.md              # Architecture decisions
│   ├── development.md               # Local dev workflow
│   ├── deployment.md                # Deployment guides
│   ├── ui-design.md                 # Design system & patterns
│   ├── product-updates.md           # Product update log rules
│   ├── modules/                     # Module-specific specs
│   └── workspace/                   # Workspace feature specs
│       └── index.md
├── build/                           # 🐳 Deployment configs
│   ├── build-frontend.sh
│   ├── push-to-ecr.example.sh
│   └── ecs-task-definition.example.json
├── public/                          # Static assets (served as-is)
├── src/
│   ├── api/                         # 🔌 Backend API wrappers
│   ├── assets/                      # 🎨 Global styles, images
│   ├── components/                  # 🧩 Shared UI components
│   ├── data/                        # Static data (teams, etc.)
│   ├── features/                    # 🎯 Feature modules
│   │   ├── contact-information/
│   │   ├── linux-passwords/
│   │   ├── product-updates/
│   │   └── workspace/               # Admin workspace feature
│   ├── i18n/                        # 🌐 Internationalization
│   │   └── locales/
│   ├── lib/                         # 🛠️ Utility functions
│   ├── pages/                       # 📄 Top-level route pages
│   ├── router/                      # 🛣️ Route config & guards
│   ├── stores/                      # 📦 Pinia state stores
│   ├── App.vue                      # Root component
│   └── main.js                      # App entry point
├── Dockerfile                       # Production container
├── nginx.container.conf             # Nginx config for SPA routing
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔗 Backend Dependency

The UI communicates with **`support-roster-server`**, which must expose:

| API Scope | Base Path | Purpose |
|-----------|-----------|---------|
| **Public Data** | `/api/**` | Viewer roster data, public contacts |
| **Workspace Admin** | `/api/workspace/**` | CRUD for staff, shifts, teams, rosters, validation |
| **Authentication** | `/api/auth/**` | Login, logout, account activation |

### Local Development Setup

1. **Start PostgreSQL** (required by backend)
2. **Start backend server** (`support-roster-server` on port `8080`)
3. **Start frontend dev server** (`npm run dev` in this directory)

**Convenience script** (from parent workspace):
```bash
../scripts/dev/restart-all.sh
```

This script handles restarting both backend and frontend services together.

For detailed backend setup, see the [support-roster-server repository README](https://github.com/yachi666/support-roster-server/blob/main/README.md).

---

## 🐳 Deployment

### Supported Deployment Paths

1. **Linux + Nginx** (static hosting)
   - Build with `npm run build`
   - Serve `dist/` with Nginx
   - Configure reverse proxy to backend API

2. **Docker + Nginx** (containerized)
   - Build Docker image: `docker build -t support-ui .`
   - Run with environment variables for `VITE_API_BASE_URL`
   - Suitable for AWS ECR/ECS Fargate or any container orchestrator

### Deployment Resources

- [`Dockerfile`](./Dockerfile) – Multi-stage build for production
- [`nginx.container.conf`](./nginx.container.conf) – Nginx config with SPA fallback
- [`build/build-frontend.sh`](./build/build-frontend.sh) – Build script
- [`build/ecs-task-definition.example.json`](./build/ecs-task-definition.example.json) – AWS ECS task template
- [`build/push-to-ecr.example.sh`](./build/push-to-ecr.example.sh) – ECR push script example

**Production Environment Variables:**

See `.env.production` for default production config. Override as needed in your deployment environment.

---

## 📚 Documentation & Specs

All frontend technical specifications live in the `.specs/` directory:

| Document | Description |
|----------|-------------|
| [`.specs/spec.md`](./.specs/spec.md) | 🗂️ Main spec navigation hub |
| [`.specs/architecture.md`](./.specs/architecture.md) | 🏛️ Architecture decisions & patterns |
| [`.specs/development.md`](./.specs/development.md) | 💻 Local dev workflow, health checks, restarts |
| [`.specs/deployment.md`](./.specs/deployment.md) | 🚀 Deployment guides (Nginx, Docker, AWS) |
| [`.specs/ui-design.md`](./.specs/ui-design.md) | 🎨 Design system, colors, typography, components |
| [`.specs/product-updates.md`](./.specs/product-updates.md) | 📝 Product update log maintenance rules |
| [`.specs/workspace/index.md`](./.specs/workspace/index.md) | 🏢 Workspace feature navigation |
| [`.specs/modules/`](./.specs/modules/) | 📦 Individual module specs |

**When to update specs:**
- Adding or changing routes, pages, components
- Modifying state management, API integration, or data models
- Changing visual rules, interaction patterns, or development workflow
- Adding or removing features

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Spec Maintenance

**Critical:** Specs are not optional. They are part of the implementation.

- ✅ **Always update `.specs/` docs** when changing routes, pages, components, state, APIs, or workflows
- ✅ **Update navigation files** (`.specs/spec.md` or relevant `index.md`) when adding new spec documents
- ✅ **Keep specs synced** with code in the same commit/PR
- ❌ **Don't create scattered spec files** outside `.specs/`

### Product Update Log

- ✅ **Maintain `src/features/product-updates/data/productUpdates.js`** for user-visible changes
- ✅ **Update both `zh-CN` and `en` entries** (bilingual requirement)
- ✅ **Write for users, not developers** (focus on value, not implementation)
- ⚠️ **Skip for internal refactors** (note "no user-visible changes" in PR description)

### Code Quality

- Follow Vue 3 Composition API best practices
- Use `<script setup>` for new components
- Maintain consistent code style (use `npm run format`)
- Write meaningful commit messages

For detailed agent instructions, see [`AGENTS.md`](./AGENTS.md).

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

**Made with ❤️ using Vue 3, Vite, and Tailwind CSS**
