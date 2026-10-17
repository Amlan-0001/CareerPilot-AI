const API_BASE = 'http://localhost:8000/api/v1';

// Listen for message events from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'LOGIN_USER') {
    handleLoginUser(request.payload)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
    return true;
  }

  if (request.type === 'FETCH_PROFILE') {
    handleFetchProfile()
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
    return true;
  }

  if (request.type === 'ANALYZE_PAGE_JD') {
    handleAnalyzeJD(request.payload)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
    return true;
  }

  if (request.type === 'AUTOFILL_FORM') {
    handleAutofillForm(request.payload)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
    return true;
  }
});

async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['career_token'], (result) => {
      resolve(result.career_token || '');
    });
  });
}

async function handleLoginUser(payload) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errMsg = 'Invalid email or password';
    if (errorData.detail) {
      errMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  // Store token and email in local storage
  await chrome.storage.local.set({
    career_token: data.access_token,
    user_email: payload.email,
  });
  return data;
}

async function handleFetchProfile() {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/memory`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return await response.json();
}

async function handleAnalyzeJD(payload) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/extension/extract-jd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    let errMsg = `API error ${response.status}`;
    if (errData.detail) {
      errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
    }
    throw new Error(errMsg);
  }
  return await response.json();
}

async function handleAutofillForm(payload) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/extension/fill-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    let errMsg = `API error ${response.status}`;
    if (errData.detail) {
      errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
    }
    throw new Error(errMsg);
  }
  return await response.json();
}
