const IMS_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

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

async function fetchActivities(tenant, clientId, token) {
  const resp = await fetch(`https://mc.adobe.io/${tenant}/target/activities`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Api-Key': clientId,
      'Content-Type': 'application/json',
    },
  });
  return resp.json();
}

async function main(params) {
  if (params.__ow_method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  const clientId = params.TARGET_CLIENT_ID;
  const clientSecret = params.TARGET_CLIENT_SECRET;
  const tenant = params.TARGET_TENANT;

  if (!clientId || !clientSecret || !tenant) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing TARGET_CLIENT_ID, TARGET_CLIENT_SECRET, or TARGET_TENANT params' }),
    };
  }

  try {
    const token = await getToken(clientId, clientSecret);
    const data = await fetchActivities(tenant, clientId, token);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

exports.main = main;
