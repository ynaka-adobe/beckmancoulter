const IMS_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';
const MC_BASE = 'https://mc.adobe.io';

async function getToken(clientId, clientSecret) {
  const resp = await fetch(IMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,target_sdk',
    }),
  });
  const { access_token: accessToken } = await resp.json();
  return accessToken;
}

function targetFetch(path, tenant, clientId, token) {
  return fetch(`${MC_BASE}/${tenant}/target${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Api-Key': clientId,
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json());
}

async function main(params) {
  if (params.__ow_method === 'OPTIONS') {
    return { statusCode: 204 };
  }

  const clientId = params.TARGET_CLIENT_ID;
  const clientSecret = params.TARGET_CLIENT_SECRET;
  const tenant = params.TARGET_TENANT;

  if (!clientId || !clientSecret || !tenant) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing TARGET_CLIENT_ID, TARGET_CLIENT_SECRET, or TARGET_TENANT params' }),
    };
  }

  // Query params arrive as top-level keys in web actions
  const resource = params.resource || 'activities';
  const activityId = params.id || null;
  const activityType = params.type || null;

  try {
    const token = await getToken(clientId, clientSecret);
    let data;

    if (resource === 'offers') {
      data = await targetFetch('/offers?sortBy=name&limit=100', tenant, clientId, token);
    } else if (resource === 'activity' && activityId && activityType) {
      data = await targetFetch(`/activities/${activityType}/${activityId}`, tenant, clientId, token);
    } else {
      data = await targetFetch('/activities', tenant, clientId, token);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

exports.main = main;
