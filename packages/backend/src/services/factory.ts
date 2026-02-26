import type {
  FunctionReference,
  RegisteredMutation,
  RegisteredQuery,
} from "convex/server";
import type {
  Infer,
  ObjectType,
  PropertyValidators,
  Validator,
} from "convex/values";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { internalMutation, internalQuery } from "../_generated/server";

// ——— Context type guards ———————————————————————————————————————————

export function isActionCtx(ctx: AnyCtx): ctx is ActionCtx {
  return "runAction" in ctx;
}

export function isMutationCtx(ctx: AnyCtx): ctx is MutationCtx {
  return "runMutation" in ctx && !("runAction" in ctx);
}

export function isQueryCtx(ctx: AnyCtx): ctx is QueryCtx {
  return !("runMutation" in ctx) && !("runAction" in ctx);
}

export type AnyCtx = MutationCtx | QueryCtx | ActionCtx;
export type MutationOrActionCtx = MutationCtx | ActionCtx;
export type QueryOrMutationCtx = QueryCtx | MutationCtx;

// ——— Action bridge helpers ————————————————————————————————————————
//
// When a method is called from an ActionCtx it cannot read/write the DB
// directly, so it must bridge through a registered internal mutation/query.
// These helpers make that dispatch one-liner.

/**
 * Run `mutationFn` if ctx is a MutationCtx, otherwise bridge through
 * `context.runMutation` (ActionCtx path).
 *
 * Usage inside a service method:
 *
 *   return runMutation(ctx, internal.services.foo.myBridgeMutation, args);
 */
export async function runMutation<Args extends Record<string, unknown>, R>(
  ctx: MutationOrActionCtx,
  ref: FunctionReference<"mutation", "internal", Args, R>,
  args: Args,
): Promise<R> {
  if (isActionCtx(ctx)) return ctx.runMutation(ref, args as any);
  // ctx is already a MutationCtx — call the handler directly by going through
  // the same ref. Convex doesn't allow calling internal refs directly from
  // mutation code, so we delegate to the caller to pass `handler` instead.
  // See `dispatchMutation` below for the ergonomic version.
  throw new Error(
    "Use dispatchMutation() when you need to call a handler directly from a MutationCtx.",
  );
}

/**
 * Dispatch pattern:
 *  - ActionCtx  → bridges via `ctx.runMutation(bridgeFn, args)`
 *  - MutationCtx → calls `handler(ctx, args)` directly (no extra hop)
 *
 * @example
 * static doWork(ctx: MutationOrActionCtx, args: MyArgs) {
 *   return dispatchMutation(
 *     ctx,
 *     args,
 *     internal.services.myService.doWorkBridge,
 *     MyService._doWorkImpl,
 *   );
 * }
 */
export async function dispatchMutation<Args extends Record<string, unknown>, R>(
  ctx: MutationOrActionCtx,
  args: Args,
  bridgeFn: FunctionReference<"mutation", "internal", Args, R>,
  handler: (ctx: MutationCtx, args: Args) => Promise<R>,
): Promise<R> {
  if (isActionCtx(ctx)) return ctx.runMutation(bridgeFn, args as any);
  return handler(ctx, args);
}

/**
 * Dispatch pattern for queries:
 *  - ActionCtx  → bridges via `ctx.runQuery(bridgeFn, args)`
 *  - QueryCtx   → calls `handler(ctx, args)` directly
 *  - MutationCtx → calls `handler(ctx, args)` directly (mutations can read)
 *
 * @example
 * static getStuff(ctx: AnyCtx, args: MyArgs) {
 *   return dispatchQuery(
 *     ctx,
 *     args,
 *     internal.services.myService.getStuffBridge,
 *     MyService._getStuffImpl,
 *   );
 * }
 */
export async function dispatchQuery<Args extends Record<string, unknown>, R>(
  ctx: AnyCtx,
  args: Args,
  bridgeFn: FunctionReference<"query", "internal", Args, R>,
  handler: (ctx: QueryCtx | MutationCtx, args: Args) => Promise<R>,
): Promise<R> {
  if (isActionCtx(ctx)) return ctx.runQuery(bridgeFn, args as any);
  return handler(ctx as QueryCtx | MutationCtx, args);
}

// ——— Abstract base class (optional, but cuts more boilerplate) ————

/**
 * Base class for services that need to work from Mutation, Query, and Action
 * contexts. Subclasses implement the `_*Impl` methods and expose public static
 * methods that use `dispatchMutation` / `dispatchQuery`.
 *
 * The bridge internalMutation / internalQuery registrations still need to live
 * in the Convex module file — Convex requires them to be top-level exports.
 * This class just removes the repetitive dispatch logic.
 *
 * @example
 * // services/subscription.ts
 *
 * export class SubscriptionService extends ConvexService {
 *   static isSubscribed(ctx: AnyCtx, args: { userId: Id<"users"> }) {
 *     return dispatchQuery(
 *       ctx,
 *       args,
 *       internal.services.subscription.isSubscribedBridge,
 *       SubscriptionService._isSubscribedImpl,
 *     );
 *   }
 *
 *   static async _isSubscribedImpl(
 *     ctx: QueryCtx | MutationCtx,
 *     args: { userId: Id<"users"> },
 *   ): Promise<SubscriptionServiceIsSubscribedReturnType> {
 *     // ... your real logic here, ctx.db is available
 *   }
 * }
 *
 * // Bridge registration (must be top-level export in the module):
 * export const isSubscribedBridge = internalQuery({
 *   args: { userId: v.id("users") },
 *   handler: (ctx, args) => SubscriptionService._isSubscribedImpl(ctx, args),
 * });
 */
export abstract class ConvexService {
  // Prevent instantiation — these are static-only utility classes.
  private constructor() {}
}

// ——— Shared types ——————————————————————————————————————————————————

type Args<V extends PropertyValidators> = ObjectType<V>;

/**
 * Typing the ref return-value slot as `any` breaks the circular inference
 * chain: _service → bridge export → internal.*.bridge → _service.
 * At runtime Convex validates the signature; the `any` never escapes to callers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BridgeRef<
  Kind extends "query" | "mutation",
  A extends PropertyValidators,
> = () => FunctionReference<Kind, "internal", Args<A>, any>;

// ——— Query service ——————————————————————————————————————————————————

interface ServiceQueryConfig<
  ArgsValidator extends PropertyValidators,
  ReturnValidator extends Validator<any, any, any>,
> {
  args: ArgsValidator;
  returns: ReturnValidator;
  /**
   * Lazy getter for the registered bridge reference. Use a thunk so the
   * `internal.*` reference resolves at call-time (after Convex codegen),
   * avoiding circular-import issues at module load.
   *
   * @example
   *   ref: () => internal.services.subscription.isSubscribedBridge
   */
  //   ref: BridgeRef<"query", ArgsValidator>;
  ref: string;
  /**
   * `NoInfer` on the return type tells TypeScript to infer `ReturnValidator`
   * exclusively from the `returns` field, then contextually type the handler
   * body against it — preserving literal types like `false`/`true` without
   * requiring an explicit return-type annotation on the handler.
   */
  handler: (
    ctx: QueryCtx | MutationCtx,
    args: Args<ArgsValidator>,
  ) => Promise<NoInfer<Infer<ReturnValidator>>>;
}

interface ServiceQuery<
  ArgsValidator extends PropertyValidators,
  ReturnValidator extends Validator<any, any, any>,
> {
  /**
   * Export this as the top-level `internalQuery` registration.
   *
   * @example
   *   export const isSubscribedBridge = isSubscribedService.bridge;
   */
  bridge: RegisteredQuery<
    "internal",
    Args<ArgsValidator>,
    Promise<Infer<ReturnValidator>>
  >;
  /**
   * Call this from your service class or anywhere that holds an `AnyCtx`.
   * Automatically bridges through `ref()` when called from an ActionCtx.
   *
   * @example
   *   static isSubscribed = isSubscribedService.execute;
   */
  execute: (
    ctx: AnyCtx,
    args: Args<ArgsValidator>,
  ) => Promise<Infer<ReturnValidator>>;
}

export function defineServiceQuery<
  ArgsValidator extends PropertyValidators,
  ReturnValidator extends Validator<any, any, any>,
>(
  config: ServiceQueryConfig<ArgsValidator, ReturnValidator>,
): ServiceQuery<ArgsValidator, ReturnValidator> {
  const bridge = internalQuery({
    args: config.args,
    returns: config.returns,
    handler: config.handler,
    // Cast needed because Convex's internalQuery wraps the return in
    // ReturnValueForOptionalValidator<V> which doesn't distribute through
    // our generic. Runtime behaviour is identical.
  }) as unknown as RegisteredQuery<
    "internal",
    Args<ArgsValidator>,
    Promise<Infer<ReturnValidator>>
  >;

  function execute(
    ctx: AnyCtx,
    args: Args<ArgsValidator>,
  ): Promise<Infer<ReturnValidator>> {
    return dispatchQuery(
      ctx,
      args,
      config.ref as unknown as FunctionReference<
        "query",
        "internal",
        Args<ArgsValidator>,
        Infer<ReturnValidator>
      >,
      config.handler,
    );
  }

  return { bridge, execute };
}

// ——— Mutation service ——————————————————————————————————————————————

interface ServiceMutationConfig<
  ArgsValidator extends PropertyValidators,
  ReturnValidator extends Validator<any, any, any>,
> {
  args: ArgsValidator;
  returns: ReturnValidator;
  /** @see ServiceQueryConfig.ref */
  //   ref: BridgeRef<"mutation", ArgsValidator>;
  ref: string;
  /** @see ServiceQueryConfig.handler */
  handler: (
    ctx: MutationCtx,
    args: Args<ArgsValidator>,
  ) => Promise<NoInfer<Infer<ReturnValidator>>>;
}

interface ServiceMutation<
  ArgsValidator extends PropertyValidators,
  ReturnValidator extends Validator<any, any, any>,
> {
  /** @see ServiceQuery.bridge */
  bridge: RegisteredMutation<
    "internal",
    Args<ArgsValidator>,
    Promise<Infer<ReturnValidator>>
  >;
  /** @see ServiceQuery.execute — only callable from MutationCtx or ActionCtx */
  execute: (
    ctx: MutationOrActionCtx,
    args: Args<ArgsValidator>,
  ) => Promise<Infer<ReturnValidator>>;
}

export function defineServiceMutation<
  ArgsValidator extends PropertyValidators,
  ReturnValidator extends Validator<any, any, any>,
>(
  config: ServiceMutationConfig<ArgsValidator, ReturnValidator>,
): ServiceMutation<ArgsValidator, ReturnValidator> {
  const bridge = internalMutation({
    args: config.args,
    returns: config.returns,
    handler: config.handler,
  }) as unknown as RegisteredMutation<
    "internal",
    Args<ArgsValidator>,
    Promise<Infer<ReturnValidator>>
  >;

  function execute(
    ctx: MutationOrActionCtx,
    args: Args<ArgsValidator>,
  ): Promise<Infer<ReturnValidator>> {
    return dispatchMutation(
      ctx,
      args,
      config.ref as unknown as FunctionReference<
        "mutation",
        "internal",
        Args<ArgsValidator>,
        Infer<ReturnValidator>
      >,
      config.handler,
    );
  }

  return { bridge, execute };
}
