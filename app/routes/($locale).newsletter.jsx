import {data} from 'react-router';

/**
 * Newsletter sign-up used by the footer form. Creates a Shopify customer
 * that accepts email marketing; an existing email is treated as success so
 * the form never reveals whether someone is already a customer.
 * @param {Route.ActionArgs}
 * @return {Promise<ReturnType<typeof data<ActionResponse>>>}
 */
export async function action({request, context}) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      return data(
        {ok: false, error: 'No pudimos suscribirte. Inténtalo más tarde.'},
        {status: 400},
      );
    }
    return data({ok: true, error: null});
  } catch (error) {
    console.error(error);
    return data(
      {ok: false, error: 'No pudimos suscribirte. Inténtalo más tarde.'},
      {status: 500},
    );
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
