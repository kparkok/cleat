/**
 * Formats any thrown value for logging. PostgrestError objects (from
 * supabase-js) aren't `Error` instances and don't stringify usefully via
 * plain `console.error(err)` or `JSON.stringify(err)` — their real content
 * (message/code/details/hint) needs to be pulled out explicitly.
 */
export function describeError(err: unknown): Record<string, unknown> {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    return {
      message: e.message ?? String(err),
      code: e.code,
      details: e.details,
      hint: e.hint,
    };
  }
  return { message: String(err) };
}
