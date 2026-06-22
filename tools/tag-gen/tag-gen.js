import DA_SDK from 'https://da.live/nx/utils/sdk.js';

// Credentials and token loaded from /tools/tag-gen/config.json (gitignored).
// Populate by running: node tools/tag-gen/refresh-token.mjs

async function loadConfig() {
  const cfg = await fetch('/tools/tag-gen/config.json').then((r) => r.json());
  if (!cfg.accessToken) throw new Error('No access token — run: node tools/tag-gen/refresh-token.mjs');
  return cfg;
}

async function getTargetToken() {
  const { accessToken } = await loadConfig();
  return accessToken;
}

async function fetchActivities(token) {
  const { tenant, clientId } = await loadConfig();
  const resp = await fetch(`https://mc.adobe.io/${tenant}/target/activities`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Api-Key': clientId,
      'Content-Type': 'application/json',
    },
  });
  const { activities } = await resp.json();
  return activities ?? [];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderActivities(activities) {
  const container = document.createElement('div');
  container.className = 'activities';

  const heading = document.createElement('h2');
  heading.textContent = 'Target Activities';
  container.append(heading);

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Type</th>
        <th>State</th>
        <th>Modified</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  activities.forEach((a) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.name}</td>
      <td>${a.type.toUpperCase()}</td>
      <td><span class="state state--${a.state}">${a.state}</span></td>
      <td>${formatDate(a.modifiedAt)}</td>
    `;
    tbody.append(tr);
  });

  table.append(tbody);
  container.append(table);
  return container;
}

(async function init() {
  const { context, token } = await DA_SDK;
  const { org, repo, path } = context;
  console.log(org, repo, path, token);

  document.body.innerHTML = '<p class="loading">Loading Target activities…</p>';

  try {
    const targetToken = await getTargetToken();
    const activities = await fetchActivities(targetToken);
    document.body.innerHTML = '';
    document.body.append(renderActivities(activities));
  } catch (err) {
    document.body.innerHTML = `<p class="error">Failed to load activities: ${err.message}</p>`;
  }
}());
