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

function targetRequest(method, path, tenant, clientId, token, body) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Api-Key': clientId,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${MC_BASE}/${tenant}/target${path}`, opts).then((r) => r.json());
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

  const resource = params.resource || 'activities';
  const activityId = params.id || null;
  const activityType = params.type || null;
  const offerId = params.offerId ? Number(params.offerId) : null;

  try {
    const token = await getToken(clientId, clientSecret);
    let data;

    if (resource === 'offers') {
      data = await targetRequest('GET', '/offers?sortBy=name&limit=100', tenant, clientId, token);

    } else if (resource === 'update-offer' && activityId && activityType && offerId) {
      // Fetch current activity definition
      const activity = await targetRequest('GET', `/activities/${activityType}/${activityId}`, tenant, clientId, token);

      if (activity.httpStatus >= 400) {
        return { statusCode: activity.httpStatus, body: JSON.stringify(activity) };
      }

      // Replace every offer reference in all experiences with the new offerId
      if (activity.experiences) {
        activity.experiences.forEach((exp) => {
          if (exp.offerLocations) {
            exp.offerLocations.forEach((loc) => { loc.offerId = offerId; });
          }
        });
      }

      data = await targetRequest('PUT', `/activities/${activityType}/${activityId}`, tenant, clientId, token, activity);

    } else {
      data = await targetRequest('GET', '/activities', tenant, clientId, token);
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
