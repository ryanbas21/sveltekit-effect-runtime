import { DemoStore, LoadMeta, RequestMeta, runtime } from "$lib";
import { fail } from "@sveltejs/kit";
import * as Effect from "effect/Effect";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = runtime.load(
  Effect.gen(function* () {
    const loadMeta = yield* LoadMeta;
    const store = yield* DemoStore;
    const snapshot = yield* store.snapshot();
    return {
      load: loadMeta,
      snapshot,
    };
  }),
);

export const actions = runtime.actions({
  remember: Effect.gen(function* () {
    const event = yield* runtime.CurrentRequestEvent;
    const request = yield* RequestMeta;
    const store = yield* DemoStore;
    const form = yield* Effect.promise<FormData>(() =>
      event.request.formData(),
    );
    const rawName = form.get("name");
    const name = typeof rawName === "string" ? rawName.trim() : "";

    if (name.length === 0) {
      return yield* Effect.fail(
        fail(400, {
          message: "Enter a name before submitting the SvelteKit action.",
        }),
      );
    }

    const remembered = yield* store.rememberName(name);
    return {
      message: `Stored "${remembered}" from ${request.path}`,
      requestId: request.requestId,
    };
  }),
}) satisfies Actions;
