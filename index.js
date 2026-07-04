import { router } from "./router.js";
import "./routes.js";
import { runDueEnrollmentsCheck } from "./lib.js";

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    const origin = env.SITE_URL;
    ctx.waitUntil(runDueEnrollmentsCheck(env, origin));
  },
};
