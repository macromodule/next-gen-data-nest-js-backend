# Contributing to Next-Gen Data Starter

Thank you for your interest in contributing to the **Next-Gen Data Starter**! We welcome bug reports, documentation improvements, feature suggestions, and pull requests from everyone.

---

## Code of Conduct
We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level. Please be respectful and constructive in all discussions.

---

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/next-gen-data-starter.git
   cd next-gen-data-starter
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Setup environment & start dependencies**:
   ```bash
   cp .env.example .env
   npm run docker:up
   npm run db:migrate
   ```
5. **Start the development server**:
   ```bash
   npm run start:dev
   ```

---

## Development Workflow

### Creating a Branch
Create a descriptive branch name from `main`:
- `feat/add-tenant-module`
- `fix/redis-cache-invalidation-ttl`
- `docs/update-drizzle-migration-guide`

### Schema Changes & Migrations
Whenever you modify files in `src/database/schema/`:
1. Generate the migration:
   ```bash
   npm run db:generate
   ```
2. Apply the migration:
   ```bash
   npm run db:migrate
   ```
3. Test with Drizzle Studio:
   ```bash
   npm run db:studio
   ```

### Code Style & Quality
Ensure your code meets the quality standards before submitting a PR:
```bash
# Format code
npm run format

# Run linter
npm run lint

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

---

## Submitting a Pull Request (PR)

1. Push your branch to GitHub.
2. Open a Pull Request against the `main` branch.
3. Provide a clear PR title and description outlining what changes were made and why.
4. Verify that the GitHub Actions CI workflow passes successfully.

Thank you for making open source better! 🚀
