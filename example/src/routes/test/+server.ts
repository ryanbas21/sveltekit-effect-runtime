import type { RequestHandler } from "@sveltejs/kit";

import { DemoStore, NeedsLogin, NotFound, RequestMeta, runtime } from "$lib";
import * as Effect from "effect/Effect";

export const GET: RequestHandler = runtime.handler(
  Effect.gen(function* () {
    const event = yield* runtime.CurrentRequestEvent;
    const request = yield* RequestMeta;
    const store = yield* DemoStore;
    const snapshot = yield* store.snapshot();

    if (event.url.searchParams.get("missing") === "true") {
      return yield* Effect.fail(
        new NotFound({
          message:
            "The runtime mapError option translated this domain failure.",
        }),
      );
    }

    if (event.url.searchParams.get("login") === "true") {
      return yield* Effect.fail(
        new NeedsLogin({
          next: event.url.pathname,
        }),
      );
    }

    return Response.json({
      endpoint: "/test",
      request,
      snapshot,
    });
  }),
);
