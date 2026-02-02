import { NoOp } from "convex-helpers/server/customFunctions";
import {
  zCustomAction,
  zCustomMutation,
  zCustomQuery,
} from "convex-helpers/server/zod4";

import { action, internalMutation, mutation, query } from "./_generated/server";
import schema from "./schema";

export const zMutation = zCustomMutation(mutation, NoOp);
export const zQuery = zCustomQuery(query, NoOp);
export const zAction = zCustomAction(action, NoOp);

export const extractPhoneAndDial = (
  from: string,
): { phone: string; dial: string } => {
  // expected format of phone: "provider:+1234567..."
  const splits = from.split(":");
  const phone = splits.length === 2 ? splits[1] : "";
  const match = phone.match(/^\+(\d{1,3})/);
  const dial = match ? match[1] : "";
  return { phone, dial };
};

export const safeParseInt = (str: string, defaultValue: number): number => {
  try {
    const parsed = parseInt(str);
    if (isNaN(parsed)) return defaultValue;
    return parsed;
  } catch (error) {
    console.error("[error](safeParseInt):", error);
    return defaultValue;
  }
};

export const clean = internalMutation({
  args: {},
  handler: async (context) => {
    const tables = Object.keys(schema.tables) as Array<
      keyof typeof schema.tables
    >;

    for (const table of tables) {
      const documents = await context.db.query(table).collect();

      for (const doc of documents) {
        await context.db.delete(doc._id);
      }
    }
  },
});
