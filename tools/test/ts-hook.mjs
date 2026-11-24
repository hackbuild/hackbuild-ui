// Lets the tests import the TypeScript sources: an extensionless relative
// import from a .ts file resolves to the .ts file beside it. Node strips
// the types itself (22.18 and up).
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (err) {
      if (err?.code !== "ERR_MODULE_NOT_FOUND" || !specifier.startsWith(".") || !context.parentURL?.endsWith(".ts")) throw err;
      return next(`${specifier}.ts`, context);
    }
  },
});
