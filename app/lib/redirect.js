import {redirect} from 'react-router';
import {safeRedirectPath} from '~/lib/urls';

/**
 * @param {Request} request
 * @param {...Array<{
 *     handle: string;
 *     data: {handle: string} & unknown;
 *   }>} [localizedResources]
 */
export function redirectIfHandleIsLocalized(request, ...localizedResources) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  localizedResources.forEach(({handle, data}) => {
    if (handle !== data.handle) {
      url.pathname = url.pathname.replace(handle, data.handle);
      shouldRedirect = true;
    }
  });

  if (shouldRedirect) {
    // Redirect to a same-origin relative path only, never an absolute URL.
    throw redirect(safeRedirectPath(`${url.pathname}${url.search}`));
  }
}
