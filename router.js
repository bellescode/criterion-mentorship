// A minimal router + request-context shim, built so route handlers can be
// written in a style very close to Hono's `c` API — but with zero npm
// dependencies, since the Cloudflare dashboard's Quick Edit code editor
// doesn't support npm packages. Everything here is plain JS, no build step.

class Ctx {
  constructor(request, env, ctx, params, url) {
    this.env = env;
    this._executionCtx = ctx;
    this._request = request;
    this._url = url;
    this._params = params;
    this._extraHeaders = new Headers();
    this.req = {
      param: (name) => this._params[name],
      query: (name) => this._url.searchParams.get(name),
      url: request.url,
      header: (name) => request.headers.get(name),
      json: () => request.json(),
      formData: () => request.formData(),
      text: () => request.text(),
    };
  }
  header(name, value) {
    this._extraHeaders.append(name, value);
  }
  _applyHeaders(res) {
    for (const [k, v] of this._extraHeaders.entries()) res.headers.append(k, v);
    return res;
  }
  html(body, status) {
    return this._applyHeaders(new Response(body, { status: status || 200, headers: { "Content-Type": "text/html; charset=utf-8" } }));
  }
  json(obj, status) {
    return this._applyHeaders(new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json" } }));
  }
  text(body, status) {
    return this._applyHeaders(new Response(body, { status: status || 200 }));
  }
  redirect(location, status) {
    return this._applyHeaders(new Response(null, { status: status || 302, headers: { Location: location } }));
  }
  notFound() {
    return this._applyHeaders(new Response("Not found", { status: 404 }));
  }
}

export class Router {
  constructor() {
    this._routes = [];
    this._middlewares = []; // { prefix, fn }
  }

  _register(method, pattern, handler) {
    const paramNames = [];
    const regexStr = "^" + pattern.replace(/:[^/]+/g, (m) => { paramNames.push(m.slice(1)); return "([^/]+)"; }) + "$";
    this._routes.push({ method, regex: new RegExp(regexStr), paramNames, handler });
  }
  get(pattern, handler) { this._register("GET", pattern, handler); }
  post(pattern, handler) { this._register("POST", pattern, handler); }
  // Simple prefix-based middleware, e.g. use('/admin/', fn) matches any path starting with /admin/
  use(prefix, fn) { this._middlewares.push({ prefix, fn }); }

  async handle(request, env, executionCtx) {
    const url = new URL(request.url);
    for (const route of this._routes) {
      if (route.method !== request.method) continue;
      const match = route.regex.exec(url.pathname);
      if (!match) continue;
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
      const c = new Ctx(request, env, executionCtx, params, url);

      const applicable = this._middlewares.filter((m) => url.pathname.startsWith(m.prefix));
      let i = 0;
      const next = async () => {
        if (i < applicable.length) {
          const mw = applicable[i++];
          return mw.fn(c, next);
        }
        return route.handler(c);
      };
      const res = await next();
      if (res) return res;
    }
    return new Response("Not found", { status: 404 });
  }
}

export const router = new Router();
