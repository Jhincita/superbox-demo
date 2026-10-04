import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';
import {applySecurityHeaders} from '~/lib/security';

/** Customer account pages and their `.data` requests, with or without a locale prefix. */
const ACCOUNT_PATH = /^(?:\/[a-z]{2}-[a-z]{2})?\/account(?:[/._]|$)/i;

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    try {
      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      let response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        response = await storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return secure(request, response);
    } catch (error) {
      // Details stay in the server log; the client only gets a generic 500.
      console.error(error);
      return secure(
        request,
        new Response('An unexpected error occurred', {
          status: 500,
          headers: {'Content-Type': 'text/plain; charset=utf-8'},
        }),
      );
    }
  },
};

/**
 * Adds the security headers (and `private, no-store` on account routes) to
 * any response, including redirects and non-HTML resources.
 * @param {Request} request
 * @param {Response} response
 */
function secure(request, response) {
  let secured = response;
  try {
    applySecurityHeaders(secured.headers);
  } catch {
    // Some responses (e.g. from fetch) have immutable headers; copy them.
    secured = new Response(response.body, response);
    applySecurityHeaders(secured.headers);
  }
  if (ACCOUNT_PATH.test(new URL(request.url).pathname)) {
    secured.headers.set('Cache-Control', 'private, no-store');
  }
  return secured;
}
