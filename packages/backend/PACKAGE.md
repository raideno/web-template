# Backend Package

This package contains the Convex backend for the application.

## Structure

```
packages/backend/
├── src/              # Source files
│   ├── index.ts      # Main entry point (exports public API)
│   ├── *.ts          # Convex functions
│   ├── models/       # Data models
│   └── services/     # Business logic services
├── dist/             # Build output (generated)
│   ├── _generated/   # Convex generated files
│   ├── index.js      # Compiled main entry
│   └── index.d.ts    # Type definitions
└── scripts/          # Utility scripts
```

## Development

### Run Development Server

This will start the Convex development server and generate the `dist/_generated` folder:

```bash
npm run dev
```

### Build for Distribution

Compile the TypeScript source to JavaScript:

```bash
npm run build
```

## Usage in Other Repositories

After running `npm run dev` or `npm run build`, you can install this package in other repositories:

### Local Development

In your other repository's `package.json`:

```json
{
  "dependencies": {
    "backend": "file:../path/to/packages/backend"
  }
}
```

### Importing

```typescript
// Import generated API
import { api, internal } from 'backend'

// Import types
import type { DataModel, Doc } from 'backend'

// Import schema
import { schema } from 'backend'

// Import models and services
import { feedbacksModel, magicService } from 'backend'

// Direct access to generated files
import { FunctionReference } from 'backend/_generated/server'
```

## Package Exports

The package exports:

- **Generated API** (`api`, `internal`)
- **Server utilities** (`query`, `mutation`, `action`, etc.)
- **Type definitions** (`Doc`, `Id`, `DataModel`, etc.)
- **Schema** configuration
- **Models** (feedbacks, magics, onboardings, quotas, users)
- **Services** (magic, quotas, subscription)
- **Configuration** (auth, stripe, analytics)
- **Parameters** and constants

## Path Aliases

Internal development uses path aliases:

- `@/convex.generated/*` → `dist/_generated/*`
- `@/convex/*` → `src/*`

These are resolved during development and build time.
