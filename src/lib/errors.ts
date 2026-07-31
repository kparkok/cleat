/**
 * Formats any thrown value for logging. PostgrestError objects (from
 * supabase-js) aren't `Error` instances and don't stringify usefully via
 * plain `console.error(err)` or `JSON.stringify(err)` — their real content
 * (message/code/details/hint) needs to be pulled out explicitly.
 */
export function describeError(err: unknown): Record<string, unknown> {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const described = {
      message: e.message ?? null,
      code: e.code ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    };
    // A real PostgrestError always has at least message or code. If neither
    // is present, `err` isn't shaped like one — fall back to a raw dump so
    // this never renders as an uninformative "{}" (JSON.stringify drops
    // `undefined` values, which is how an all-undefined object collapses to
    // "{}" in some logging surfaces; `null` above avoids that specifically).
    if (described.message === null && described.code === null) {
      return { message: String(err), raw: { ...e } };
    }
    return described;
  }
  return { message: String(err) };
}
