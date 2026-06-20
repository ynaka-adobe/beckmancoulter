/**
 * Commerce Products Block
 * Fetches live product data from Adobe Commerce (Venia demo store) via GraphQL
 * and renders a product grid.
 *
 * Block authored content:
 *   Row 1: search term (e.g. "jacket")
 *   Row 2: number of products to show (optional, default 4)
 */

const GRAPHQL_ENDPOINT = 'https://venia.magento.com/graphql';

async function fetchProducts(search, pageSize) {
  const query = `{
    products(search: "${search}", pageSize: ${pageSize}) {
      items {
        name
        sku
        url_key
        small_image { url label }
        price_range {
          minimum_price {
            regular_price { value currency }
          }
        }
      }
    }
  }`;

  const resp = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!resp.ok) throw new Error(`GraphQL request failed: ${resp.status}`);
  const { data } = await resp.json();
  return data?.products?.items ?? [];
}

function formatPrice(value, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

function renderProducts(products) {
  const ul = document.createElement('ul');
  ul.className = 'commerce-products-grid';

  products.forEach((product) => {
    const price = product.price_range.minimum_price.regular_price;
    const li = document.createElement('li');
    li.className = 'commerce-products-card';
    li.innerHTML = `
      <a href="https://venia.magento.com/${product.url_key}.html" target="_blank" rel="noopener">
        <div class="commerce-products-image">
          <img src="${product.small_image.url}" alt="${product.small_image.label || product.name}" loading="lazy">
        </div>
        <div class="commerce-products-body">
          <p class="commerce-products-name">${product.name}</p>
          <p class="commerce-products-price">${formatPrice(price.value, price.currency)}</p>
        </div>
      </a>
    `;
    ul.append(li);
  });

  return ul;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const search = rows[0]?.textContent?.trim() || 'shirt';
  const pageSize = parseInt(rows[1]?.textContent?.trim(), 10) || 4;

  block.textContent = '';

  const loading = document.createElement('p');
  loading.className = 'commerce-products-loading';
  loading.textContent = 'Loading products…';
  block.append(loading);

  try {
    const products = await fetchProducts(search, pageSize);
    loading.remove();
    if (products.length === 0) {
      block.innerHTML = '<p>No products found.</p>';
      return;
    }
    block.append(renderProducts(products));
  } catch (err) {
    loading.textContent = 'Could not load products.';
    // eslint-disable-next-line no-console
    console.error('Commerce Products block:', err);
  }
}
