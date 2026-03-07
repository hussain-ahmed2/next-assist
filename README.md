# NextAssist ⚡

### The Learning OS for Modern Teams

**NextAssist** is a premium, multi-tenant B2B Learning Management System (LMS) designed for organizations that demand total data isolation, high-performance architecture, and a world-class user experience. Built with a sleek, X-inspired aesthetic, it provides a fully white-labeled platform for teams to manage internal training, expert-led courses, and member progress.

![Hero Banner](https://img.shields.io/badge/Architecture-Multi--Tenant-6366f1?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Database](https://img.shields.io/badge/PostgreSQL-Drizzle-336791?style=for-the-badge&logo=postgresql)
![Auth](https://img.shields.io/badge/Better--Auth-Secure-000000?style=for-the-badge)

---

## ✨ Key Features

- 🏢 **Multi-Tenant Isolation**: Each organization operates in a secure environment with schema-level data separation.
- 🎨 **White Labeling**: Customize branding, components, and domains for every tenant.
- 🔐 **Industrial-Grade RBAC**: Built-in Role-Based Access Control for:
    - **Super Admin**: Global platform management.
    - **Org Admin**: Organization-specific governance.
    - **Expert**: Content creation and domain expertise.
    - **Member**: Interactive learning and progress tracking.
- 📊 **Advanced Analytics**: Interactive dashboards powered by **Recharts** and **TanStack Table**.
- 🚀 **X-Inspired UI**: A premium, "glassmorphic" design system using **Shadcn UI** and **Tailwind CSS 4**.
- 🔐 **Auth-First**: Secure session management and authentication powered by **Better-Auth**.
- 🔄 **Real-time Drag-and-Drop**: Interactive course builders and layouts using **@dnd-kit**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better-Auth](https://better-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State & Tables**: [Zustand](https://zustand-demo.pmnd.rs/), [TanStack Table v8](https://tanstack.com/table/v8)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```bash
src/
├── actions/        # Server Actions (Mutations & Logic)
├── app/            # Next.js App Router (RBAC Groups)
│   ├── (admin)/    # Super Admin Dashboard
│   ├── (org_admin)/# Organization Admin Dashboard
│   ├── (expert)/   # Expert/Instructor Workspace
│   ├── (member)/   # Consumer Learning Area
│   └── (auth)/     # Authentication flows
├── components/     # High-performance UI components
├── db/             # Drizzle Schema & DB Client
├── hooks/          # Custom Client-side React hooks
├── lib/            # Shared utilities and configurations
├── store/          # Zustand global state management
└── types/          # Global TypeScript interfaces
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20 or higher)
- **PNPM** (recommended) or NPM/Yarn
- A **PostgreSQL** database (e.g., Neon.tech)

### 2. Installation
```bash
git clone https://github.com/your-repo/next-assist.git
cd next-assist
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL='your_postgresql_url'
BETTER_AUTH_URL='http://localhost:3000'
BETTER_AUTH_SECRET='your_random_secret' # Generate with: openssl rand -base64 32
```

### 4. Database Initialization
```bash
# Generate migrations
pnpm db:generate

# Push changes to database
pnpm db:push

# Seed initial data (Admin/Roles)
pnpm db:seed
```

### 5. Start Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to see your local instance.

---

## 🛠️ CLI Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server |
| `pnpm db:generate` | Creates migration files from drizzle schema |
| `pnpm db:push` | Pushes schema changes directly to the database |
| `pnpm db:migrate` | Runs existing migrations |
| `pnpm db:seed` | Populates the database with initial seed data |
| `pnpm db:reset` | Resets the database schema |
| `pnpm db:fresh` | Drops everything, pushes fresh, and seeds |

---

## 📜 License & Credits

Created with ❤️ by **[Hussain Ahmed](https://github.com/hussain-ahmed2)**. All rights reserved. Built with the **X/Twitter Aesthetic**.
