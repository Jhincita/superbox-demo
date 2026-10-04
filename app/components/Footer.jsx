import {Suspense, useEffect, useRef} from 'react';
import {Await, Link, useFetcher} from 'react-router';
import {Logo} from '~/components/Icon';
import {getCategories} from '~/lib/categories';
import {STORE} from '~/lib/storeConfig';
import {toRelativeUrl} from '~/lib/urls';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const categories = getCategories(header);
  const primaryDomainUrl = header?.shop.primaryDomain?.url;
  const year = new Date().getFullYear();

  return (
    <>
      <Newsletter />
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-about">
            <Link className="footer-brand" prefetch="intent" to="/">
              <Logo size={32} />
              <span>{STORE.name}</span>
            </Link>
            <p>{STORE.about}</p>
          </div>
          <nav className="footer-col" aria-label="Catálogo">
            <h6>Catálogo</h6>
            {categories.map((c) => (
              <Link key={c.id} prefetch="intent" to={`/collections/${c.handle}`}>
                {c.title}
              </Link>
            ))}
            <Link prefetch="intent" to="/collections/all">
              Todos los productos
            </Link>
          </nav>
          <nav className="footer-col" aria-label="Ayuda">
            <h6>Ayuda</h6>
            <Link prefetch="intent" to={STORE.contactPath}>
              Contacto
            </Link>
            <a href={STORE.supportUrl} rel="noopener noreferrer" target="_blank">
              Soporte técnico
            </a>
            <a href={STORE.whatsappUrl} rel="noopener noreferrer" target="_blank">
              WhatsApp
            </a>
            <Suspense>
              <Await resolve={footerPromise}>
                {(footer) =>
                  (footer?.menu?.items ?? []).map((item) => {
                    const url = toRelativeUrl(
                      item.url,
                      primaryDomainUrl,
                      publicStoreDomain,
                    );
                    if (!url) return null;
                    return url.startsWith('/') ? (
                      <Link key={item.id} prefetch="intent" to={url}>
                        {item.title}
                      </Link>
                    ) : (
                      <a
                        href={url}
                        key={item.id}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {item.title}
                      </a>
                    );
                  })
                }
              </Await>
            </Suspense>
          </nav>
          <div className="footer-col">
            <h6>Newsletter</h6>
            <p>Ofertas antes que nadie.</p>
            <a href="#newsletter">Suscríbete</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {year} Superbox · {STORE.location}
          </span>
          <span>Precios en CLP, impuesto incluido</span>
        </div>
      </footer>
    </>
  );
}

function Newsletter() {
  /** @type {import('react-router').FetcherWithComponents<import('~/routes/($locale).newsletter').ActionResponse>} */
  const fetcher = useFetcher({key: 'newsletter'});
  const formRef = useRef(null);
  const ok = fetcher.data?.ok;

  useEffect(() => {
    if (ok) formRef.current?.reset();
  }, [ok]);

  const message =
    fetcher.state !== 'idle'
      ? 'Enviando…'
      : fetcher.data?.ok
        ? 'Listo. Te avisaremos de las próximas ofertas.'
        : fetcher.data?.error ?? '';

  return (
    <section className="container newsletter" id="newsletter">
      <div className="newsletter-inner">
        <div>
          <h2>Las ofertas, primero para ti.</h2>
          <p>
            Suscríbete y mantente informado de todas nuestras ofertas y nuevos
            equipos.
          </p>
        </div>
        <fetcher.Form method="post" action="/newsletter" ref={formRef}>
          <div className="newsletter-field">
            <input
              aria-label="Correo electrónico"
              autoComplete="email"
              maxLength={254}
              name="email"
              placeholder="Tu correo electrónico"
              required
              type="email"
            />
            <button type="submit" disabled={fetcher.state !== 'idle'}>
              Suscribirme
            </button>
          </div>
          {/* Honeypot: hidden from people, filled by naive bots. */}
          <div className="newsletter-hp" aria-hidden="true">
            <label>
              No completar
              <input autoComplete="off" name="company" tabIndex={-1} type="text" />
            </label>
          </div>
          <span className="newsletter-msg" role="status">
            {message}
          </span>
        </fetcher.Form>
      </div>
    </section>
  );
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
