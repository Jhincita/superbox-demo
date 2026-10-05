import {data} from 'react-router';
import {clientIp, hitRateLimit} from '~/lib/rateLimit';
import {isSameOriginRequest} from '~/lib/security';

/** RFC 5321 limit on an email address. */
const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Largest request body accepted (the form has two short fields). */
const MAX_BODY_BYTES = 4096;

/** Sign-ups allowed per client IP per minute. */
const RATE_LIMIT = {limit: 5, windowSeconds: 60};

const GENERIC_ERROR = 'No pudimos suscribirte. Inténtalo más tarde.';

/**
 * Newsletter sign-up used by the footer form. Creates a Shopify customer
 * that accepts email marketing; an existing email is treated as success so
 * the form never reveals whether someone is already a customer.
 * @param {Route.ActionArgs}
 * @return {Promise<ReturnType<typeof data<ActionResponse>>>}
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({ok: false, error: GENERIC_ERROR}, {status: 405});
  }

  // CSRF defense in depth: only accept posts from the storefront itself.
  if (!isSameOriginRequest(request, [context.env.PUBLIC_STORE_DOMAIN])) {
    return data({ok: false, error: GENERIC_ERROR}, {status: 403});
  }

  const allowed = await hitRateLimit({
    key: `newsletter:${clientIp(request)}`,
    ...RATE_LIMIT,
  });
  if (!allowed) {
    return data(
      {ok: false, error: 'Demasiados intentos. Espera un minuto.'},
      {status: 429, headers: {'Retry-After': String(RATE_LIMIT.windowSeconds)}},
    );
  }

  // The form has two short fields; refuse oversized or unsized (chunked)
  // bodies before parsing, so formData() never buffers an unbounded body.
  const contentLength = Number(request.headers.get('Content-Length'));
  if (
    !Number.isInteger(contentLength) ||
    contentLength <= 0 ||
    contentLength > MAX_BODY_BYTES
  ) {
    return data({ok: false, error: GENERIC_ERROR}, {status: 413});
  }

  const form = await request.formData();

  // Honeypot: people never see this field. Pretend it worked for bots.
  if (String(form.get('company') ?? '') !== '') {
    return data({ok: true, error: null});
  }

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return data({ok: false, error: 'Ingresa un correo válido.'}, {status: 400});
  }

  try {
    const {customerCreate} = await context.storefront.mutate(
      NEWSLETTER_SIGNUP_MUTATION,
      {
        variables: {
          input: {
            email,
            acceptsMarketing: true,
            // The customer never uses this password; it is required by the API.
            password: crypto.randomUUID(),
          },
        },
      },
    );

    const errors = customerCreate?.customerUserErrors ?? [];
    const alreadyExists = errors.some((e) =>
      ['TAKEN', 'CUSTOMER_DISABLED'].includes(e.code ?? ''),
    );
    if (errors.length && !alreadyExists) {
      console.error(errors);
      return data({ok: false, error: GENERIC_ERROR}, {status: 400});
    }
    return data({ok: true, error: null});
  } catch (error) {
    console.error(error);
    return data({ok: false, error: GENERIC_ERROR}, {status: 500});
  }
}

export async function loader() {
  throw new Response(null, {status: 404});
}

const NEWSLETTER_SIGNUP_MUTATION = `#graphql
  mutation NewsletterSignup(
    $input: CustomerCreateInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

/**
 * @typedef {{ok: boolean; error: string | null}} ActionResponse
 */

/** @typedef {import('./+types/($locale).newsletter').Route} Route */
