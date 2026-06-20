const GEO_KEY = 'aem-geo';
const GEO_API = 'https://get.geojs.io/v1/ip/geo.json';

let geoPromise = null;

/**
 * Returns visitor geo data. Result is cached in sessionStorage for the session.
 * Shape: { country, country_code, region, city, latitude, longitude, ip }
 */
export async function getGeo() {
  const cached = sessionStorage.getItem(GEO_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* fall through */ }
  }

  if (!geoPromise) {
    geoPromise = fetch(GEO_API)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  const data = await geoPromise;
  if (data) sessionStorage.setItem(GEO_KEY, JSON.stringify(data));
  return data;
}

/**
 * Convenience: returns ISO 3166-1 alpha-2 country code (e.g. "US", "DE", "JP").
 */
export async function getCountryCode() {
  const geo = await getGeo();
  return geo?.country_code ?? null;
}
