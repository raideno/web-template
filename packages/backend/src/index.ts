/**
 * Backend package entry point.
 *
 * Exports shared types and utilities for use in other packages.
 * Path aliases (@/) used here are resolved by tsup at build time —
 * the compiled dist/ output contains only plain resolved imports.
 */

// Data model types
export type { Doc, Id, TableNames } from "@/convex/dataModel";

// Server context types
export type {
  QueryCtx,
  MutationCtx,
  ActionCtx,
  DatabaseReader,
  DatabaseWriter,
} from "@/convex/server";

// Schema
export { default as schema } from "@/schema";

// Table definitions & constants
export { UsersTable } from "@/models/users";
export { FeedbacksTable } from "@/models/feedbacks";
export { CountersTable, DEFAULT_QUOTAS } from "@/models/quotas";
