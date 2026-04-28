# Support Roster UI

[中文](./README.zh-CN.md) · [Parent workspace](https://github.com/yachi666/support-platform)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06b6d4?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5fa04e?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

`support-roster-ui` is the Vue 3 frontend for the support roster platform. It ships a single Vite SPA with a public roster viewer, authenticated admin workspace, contact information pages, product update notes, and protected operational tools.

This repository is designed to run as a submodule of [`support-platform`](https://github.com/yachi666/support-platform), where the backend, automation tests, local scripts, and curated screenshots are coordinated.

## Screenshots

| Public viewer | Workspace overview |
|---|---|
| ![Public roster viewer](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/public-viewer.png) | ![Workspace overview](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-overview.png) |

| Monthly roster | Validation center |
|---|---|
| ![Monthly roster planner](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-roster.png) | ![Workspace validation center](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-validation.png) |

## Product Surfaces

| Surface | Route | Purpose |
|---------|-------|---------|
| Public Viewer | `/viewer` | Read-only on-call timeline with date and timezone controls. |
| Login | `/login` | Staff ID login and account activation. |
| Admin Workspace | `/workspace/*` | Roster operations for overview, monthly planning, staff, shifts, teams, validation, import/export, and accounts. |
| Contact Information | `/contact-information` | Public and admin contact information flows. |
| Linux Passwords | `/linux-passwords` | Protected operational page gated by workspace access policy. |
| Product Updates | `/product-updates` | User-facing release notes maintained with visible product changes. |

## Highlights

- Vue 3 SPA powered by Vite.
- Route-level split between public, authenticated, and role-gated surfaces.
- Central API layer for `/api/**` and `/api/workspace/**`.
- Workspace access policy checks before protected page entry.
- Tailwind CSS 4 styling with lucide icons.
- Docker + Nginx deployment path for static hosting.
- Frontend specifications maintained under `.specs/`.

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | `Vue 3.5` |
| Build Tool | `Vite 7` |
| Router | `Vue Router 5` |
| State | Vue reactivity, composables, and `Pinia` |
| Styling | `Tailwind CSS 4` |
| UI Helpers | `lucide-vue-next`, `radix-vue`, `class-variance-authority`, `tailwind-merge` |
| Date Utilities | `date-fns`, `date-fns-tz` |
| Runtime | `Node.js ^20.19.0 || >=22.12.0` |

## Quick Start

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm
- A reachable backend API, normally `http://127.0.0.1:8080/api`

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Default local API configuration:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

### Build and Preview

```bash
npm run build
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the production static bundle. |
| `npm run preview` | Preview the production build locally. |
| `npm run format` | Format `src/` with Prettier. |

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL used by the frontend build. | `http://127.0.0.1:8080/api` |
| `VITE_XMATTERS_URL` | External Systems drawer link for xMatters. | `https://www.xmatters.com/` |
| `VITE_SERVICENOW_URL` | External Systems drawer link for ServiceNow. | `https://www.servicenow.com/` |
| `VITE_MESSAGE_DELIVERY_KB_URL` | External Systems drawer link for Message Delivery Knowledge Base. | `https://learn.microsoft.com/` |

Production defaults and deployment examples live in `.env.production`, `Dockerfile`, and `build/`.

## Architecture

```text
Browser
  └── Vue 3 SPA
      ├── /viewer                 # Public roster viewer
      ├── /login                  # Authentication and activation
      ├── /workspace/*            # Admin workspace shell
      ├── /contact-information    # Contact information flows
      ├── /linux-passwords        # Protected operational tool
      ├── /product-updates        # Product update log
      └── src/api/                # Backend API client layer
              ↓
        support-roster-server
```

## Directory Guide

```text
support-roster-ui/
├── .specs/                      # Frontend specs and product notes
├── build/                       # Nginx, ECR, and ECS deployment examples
├── public/                      # Static public assets
├── src/
│   ├── api/                     # Backend request wrappers
│   ├── assets/                  # Global styles and shared assets
│   ├── components/              # Public viewer components
│   ├── features/                # Feature domains
│   │   ├── contact-information/
│   │   ├── linux-passwords/
│   │   ├── product-updates/
│   │   └── workspace/
│   ├── pages/                   # Top-level route pages
│   ├── router/                  # Route definitions and guards
│   ├── stores/                  # Pinia stores
│   ├── App.vue
│   └── main.js
├── Dockerfile
├── nginx.container.conf
├── package.json
└── vite.config.js
```

## Backend Dependency

The UI expects `support-roster-server` to expose:

| API Area | Base Path |
|----------|-----------|
| Viewer and public data | `/api/**` |
| Workspace administration | `/api/workspace/**` |
| Authentication | `/api/auth/**` |

For local development, start PostgreSQL and the backend before running the Vite server. From the parent workspace, `../scripts/dev/restart-all.sh` can restart both services.

## Deployment

Supported deployment paths:

- Static build served by Linux + Nginx.
- Docker image served by Nginx, suitable for ECR/ECS Fargate-style deployment.

Relevant files:

- [`Dockerfile`](./Dockerfile)
- [`nginx.container.conf`](./nginx.container.conf)
- [`build/build-frontend.sh`](./build/build-frontend.sh)
- [`build/ecs-task-definition.example.json`](./build/ecs-task-definition.example.json)
- [`build/push-to-ecr.example.sh`](./build/push-to-ecr.example.sh)

## Documentation

- Frontend spec index: [`./.specs/spec.md`](./.specs/spec.md)
- Architecture: [`./.specs/architecture.md`](./.specs/architecture.md)
- Development workflow: [`./.specs/development.md`](./.specs/development.md)
- Workspace specs: [`./.specs/workspace/index.md`](./.specs/workspace/index.md)
- Deployment specs: [`./.specs/deployment.md`](./.specs/deployment.md)
- Product update log rules: [`./.specs/product-updates.md`](./.specs/product-updates.md)

## Contributing

Before changing routes, pages, component behavior, state, API integration, data models, visual rules, or development workflow, update the matching `.specs/` document in the same change.

For user-visible changes, also maintain `src/features/product-updates/data/productUpdates.js` in both `zh-CN` and `en` unless the change is purely internal.

## License

This project is released under the [MIT License](./LICENSE).
