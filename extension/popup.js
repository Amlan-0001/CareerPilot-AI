document.addEventListener('DOMContentLoaded', () => {
  console.log('[CareerOS] Extension popup loaded with Human-in-the-Loop Approval System.');

  // Element references
  const statusBadge = document.getElementById('statusBadge');
  const userAccountBar = document.getElementById('userAccountBar');
  const userEmailText = document.getElementById('userEmailText');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginCard = document.getElementById('loginCard');
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const syncWebTabBtn = document.getElementById('syncWebTabBtn');
  const workspacePanel = document.getElementById('workspacePanel');

  // Tabs
  const tabAnalyzer = document.getElementById('tabAnalyzer');
  const tabAutofill = document.getElementById('tabAutofill');
  const contentAnalyzer = document.getElementById('contentAnalyzer');
  const contentAutofill = document.getElementById('contentAutofill');

  // Actions & Panels
  const analyzeJdBtn = document.getElementById('analyzeJdBtn');
  const resultsPanel = document.getElementById('resultsPanel');
  const scoreBadge = document.getElementById('scoreBadge');
  const summaryText = document.getElementById('summaryText');
  const missingSkillsContainer = document.getElementById('missingSkillsContainer');

  // Autofill Human Approval Gate Elements
  const scanActionCard = document.getElementById('scanActionCard');
  const scanFormBtn = document.getElementById('scanFormBtn');
  const proposalReviewPanel = document.getElementById('proposalReviewPanel');
  const proposalCountBadge = document.getElementById('proposalCountBadge');
  const proposalsContainer = document.getElementById('proposalsContainer');
  const fillApprovedBtn = document.getElementById('fillApprovedBtn');
  const approveAllBtn = document.getElementById('approveAllBtn');
  const cancelProposalsBtn = document.getElementById('cancelProposalsBtn');

  // Report Elements
  const verificationReportCard = document.getElementById('verificationReportCard');
  const statDetected = document.getElementById('statDetected');
  const statApproved = document.getElementById('statApproved');
  const statFilled = document.getElementById('statFilled');
  const statManual = document.getElementById('statManual');
  const messageToast = document.getElementById('messageToast');

  // State Management
  let currentProposals = [];
  let currentActiveTabId = null;

  initAuthSession();

  async function initAuthSession() {
    await checkBackendHealth();

    chrome.storage.local.get(['career_token', 'user_email'], async (res) => {
      if (res.career_token) {
        console.log('[CareerOS] Active session found:', res.user_email);
        setLoggedInState(res.user_email || 'Authenticated User');
      } else {
        await tryAutoSyncFromWebTab();
      }
    });
  }

  async function checkBackendHealth() {
    try {
      const res = await fetch('http://localhost:8000/api/v1/health');
      if (res.ok) {
        statusBadge.innerText = 'API: Online';
        statusBadge.className = 'badge badge-connected';
      } else {
        statusBadge.innerText = 'API: Error';
        statusBadge.className = 'badge badge-disconnected';
      }
    } catch {
      statusBadge.innerText = 'API: Offline';
      statusBadge.className = 'badge badge-disconnected';
    }
  }

  function setLoggedInState(email) {
    userEmailText.innerText = email;
    userAccountBar.classList.remove('hidden');
    loginCard.classList.add('hidden');
    workspacePanel.classList.remove('hidden');
  }

  function setLoggedOutState() {
    chrome.storage.local.remove(['career_token', 'user_email'], () => {
      userAccountBar.classList.add('hidden');
      loginCard.classList.remove('hidden');
      workspacePanel.classList.add('hidden');
      showToast('Logged out');
    });
  }

  // Script injection fallback
  async function sendTabMessageWithFallback(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (err) {
      if (err.message && err.message.includes('Receiving end does not exist')) {
        console.log('[CareerOS] Injecting content.js fallback into tab:', tabId);
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js'],
        });
        await new Promise((r) => setTimeout(r, 120));
        return await chrome.tabs.sendMessage(tabId, message);
      }
      throw err;
    }
  }

  // Auth Handlers
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (!email || !password) return;

    loginSubmitBtn.innerText = 'Signing In...';
    loginSubmitBtn.disabled = true;

    chrome.runtime.sendMessage(
      { type: 'LOGIN_USER', payload: { email, password } },
      (res) => {
        loginSubmitBtn.innerText = 'Sign In & Sync Account';
        loginSubmitBtn.disabled = false;
        if (res && res.success) {
          showToast('Signed in & synced with CareerPilot!');
          setLoggedInState(email);
        } else {
          showToast(res.error || 'Login failed. Check credentials.');
        }
      }
    );
  });

  syncWebTabBtn.addEventListener('click', async () => {
    const synced = await tryAutoSyncFromWebTab();
    if (synced) showToast('Synced session from active website tab!');
    else showToast('No active website tab logged in on http://localhost:3000');
  });

  async function tryAutoSyncFromWebTab() {
    try {
      const tabs = await chrome.tabs.query({ url: ['*://localhost/*', '*://127.0.0.1/*'] });
      if (!tabs || tabs.length === 0) return false;

      for (const tab of tabs) {
        try {
          const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => ({
              token: localStorage.getItem('career_token'),
              email: localStorage.getItem('career_user_email'),
            }),
          });

          if (result && result.token) {
            await chrome.storage.local.set({
              career_token: result.token,
              user_email: result.email || 'Web Synced User',
            });
            setLoggedInState(result.email || 'Web Synced User');
            return true;
          }
        } catch (e) {
          console.warn('[CareerOS] Script sync error:', e);
        }
      }
    } catch (err) {
      console.warn('[CareerOS] Sync check error:', err);
    }
    return false;
  }

  logoutBtn.addEventListener('click', setLoggedOutState);

  // Navigation
  tabAnalyzer.addEventListener('click', () => {
    tabAnalyzer.classList.add('active');
    tabAutofill.classList.remove('active');
    contentAnalyzer.classList.remove('hidden');
    contentAutofill.classList.add('hidden');
  });

  tabAutofill.addEventListener('click', () => {
    tabAutofill.classList.add('active');
    tabAnalyzer.classList.remove('active');
    contentAutofill.classList.remove('hidden');
    contentAnalyzer.classList.add('hidden');
  });

  // JD Analyzer
  analyzeJdBtn.addEventListener('click', async () => {
    analyzeJdBtn.innerText = 'Analyzing Content...';
    analyzeJdBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('No active browser tab found');
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://'))) {
        throw new Error('Please open a webpage or job application tab first.');
      }

      const domRes = await sendTabMessageWithFallback(tab.id, { type: 'EXTRACT_DOM_TEXT' });
      chrome.runtime.sendMessage(
        { type: 'ANALYZE_PAGE_JD', payload: { page_text: domRes.pageText, page_url: domRes.pageUrl } },
        (res) => {
          analyzeJdBtn.innerText = '✨ Analyze Page Job Description';
          analyzeJdBtn.disabled = false;

          if (res && res.success && res.data && res.data.analysis) {
            const analysis = res.data.analysis;
            scoreBadge.innerText = `${analysis.match_score || 0}%`;
            summaryText.innerText = analysis.summary || 'Analysis completed.';

            missingSkillsContainer.innerHTML = '';
            (analysis.missing_skills || []).forEach((sk) => {
              const tag = document.createElement('span');
              tag.className = 'tag-item';
              tag.innerText = sk;
              missingSkillsContainer.appendChild(tag);
            });
            resultsPanel.classList.remove('hidden');
            showToast('JD Analysis complete!');
          } else {
            showToast(res.error || 'Analysis failed.');
          }
        }
      );
    } catch (err) {
      analyzeJdBtn.innerText = '✨ Analyze Page Job Description';
      analyzeJdBtn.disabled = false;
      showToast(err.message || 'Analysis failed.');
    }
  });

  // =========================================================================
  // HUMAN-IN-THE-LOOP AUTOFILL PIPELINE (SCAN -> PROPOSE -> REVIEW -> FILL)
  // =========================================================================

  // STEP 1: SCAN PAGE & GENERATE PROPOSALS (STOPS HERE, DOES NOT FILL DOM)
  scanFormBtn.addEventListener('click', async () => {
    console.log('[CareerOS] Step 1: Scan & Propose initiated.');
    scanFormBtn.innerText = 'Scanning Page & Generating Proposals...';
    scanFormBtn.disabled = true;
    verificationReportCard.classList.add('hidden');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('No active browser tab found');
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://'))) {
        throw new Error('Please open a webpage or application form tab first.');
      }

      currentActiveTabId = tab.id;

      // 1. Detect Fields from Page DOM
      const scanRes = await sendTabMessageWithFallback(tab.id, { type: 'SCAN_FORM_FIELDS' });

      if (!scanRes || !scanRes.fields || scanRes.fields.length === 0) {
        showToast('No form input fields detected on active webpage.');
        scanFormBtn.innerText = '🔍 Scan Page & Propose Autofill';
        scanFormBtn.disabled = false;
        return;
      }

      console.log(`[CareerOS] ${scanRes.fields.length} fields detected. Requesting AI memory mapping proposals...`);

      // 2. Fetch AI Proposals from Backend (NO DOM INJECTION YET)
      chrome.runtime.sendMessage(
        {
          type: 'AUTOFILL_FORM',
          payload: { fields: scanRes.fields, job_description: scanRes.pageText || '' },
        },
        (res) => {
          scanFormBtn.innerText = '🔍 Scan Page & Propose Autofill';
          scanFormBtn.disabled = false;

          if (res && res.success && res.data && res.data.fields) {
            currentProposals = res.data.fields.map((p) => ({
              ...p,
              approved: p.source !== 'Not Found', // Pre-select approval if value was found
              userEditedValue: p.proposed_value || '',
            }));

            renderProposalsList(currentProposals);
            scanActionCard.classList.add('hidden');
            proposalReviewPanel.classList.remove('hidden');
            showToast(`Found ${currentProposals.length} fields! Please review proposals below.`);
          } else {
            showToast(res.error || 'Failed to generate form proposals.');
          }
        }
      );
    } catch (err) {
      scanFormBtn.innerText = '🔍 Scan Page & Propose Autofill';
      scanFormBtn.disabled = false;
      showToast(err.message || 'Scan failed.');
    }
  });

  // Render Proposals UI
  function renderProposalsList(proposals) {
    proposalCountBadge.innerText = `${proposals.length} Fields Found`;
    proposalsContainer.innerHTML = '';

    proposals.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = `proposal-card ${p.approved ? 'approved' : 'rejected'}`;

      const confClass = p.confidence === 'High' ? 'conf-high' : p.confidence === 'Medium' ? 'conf-medium' : 'conf-low';

      card.innerHTML = `
        <div class="proposal-card-header">
          <span class="question-label">${p.label || 'Question'}</span>
          <div class="meta-badges">
            <span class="conf-tag ${confClass}">${p.confidence || 'Low'}</span>
          </div>
        </div>

        <div class="source-text">Source: ${p.source || 'AI Memory'}</div>

        ${
          p.is_resume_upload
            ? `<div class="proposal-input" style="color: #a5b4fc; font-weight: 600;">📄 Master Resume.pdf (Manual Selection Required for Browser Security)</div>`
            : p.type === 'textarea'
            ? `<textarea class="proposal-input" rows="2">${p.userEditedValue}</textarea>`
            : `<input type="text" class="proposal-input" value="${p.userEditedValue}" placeholder="Enter value manually..." />`
        }

        <div class="proposal-actions">
          <button class="btn-action-small btn-approve ${p.approved ? 'active' : ''}">
            ${p.approved ? '✓ Approved' : 'Approve'}
          </button>
          <button class="btn-action-small btn-reject ${!p.approved ? 'active' : ''}">
            ${!p.approved ? '✕ Rejected' : 'Reject'}
          </button>
        </div>
      `;

      // Input edit handler
      const inputEl = card.querySelector('.proposal-input');
      if (inputEl && !p.is_resume_upload) {
        inputEl.addEventListener('input', (e) => {
          p.userEditedValue = e.target.value;
          p.approved = true; // Auto approve when human manually types an edit
          card.className = 'proposal-card approved';
          card.querySelector('.btn-approve').className = 'btn-action-small btn-approve active';
          card.querySelector('.btn-approve').innerText = '✓ Approved';
          card.querySelector('.btn-reject').className = 'btn-action-small btn-reject';
          card.querySelector('.btn-reject').innerText = 'Reject';
        });
      }

      // Approve button click
      card.querySelector('.btn-approve').addEventListener('click', () => {
        p.approved = true;
        renderProposalsList(proposals);
      });

      // Reject button click
      card.querySelector('.btn-reject').addEventListener('click', () => {
        p.approved = false;
        renderProposalsList(proposals);
      });

      proposalsContainer.appendChild(card);
    });
  }

  // STEP 2: HUMAN APPROVAL & FILL EXECUTION (ONLY EXECUTED UPON EXPLICIT CLICK)
  fillApprovedBtn.addEventListener('click', async () => {
    const approvedList = currentProposals
      .filter((p) => p.approved)
      .map((p) => ({
        ...p,
        proposed_value: p.userEditedValue,
      }));

    if (approvedList.length === 0) {
      showToast('No fields approved for autofill.');
      return;
    }

    fillApprovedBtn.innerText = 'Injecting Approved Values...';
    fillApprovedBtn.disabled = true;

    try {
      console.log('[CareerOS] Executing DOM injection for approved fields:', approvedList.length);
      const injectRes = await sendTabMessageWithFallback(currentActiveTabId, {
        type: 'INJECT_AUTOFILL_VALUES',
        approvedFields: approvedList,
      });

      fillApprovedBtn.innerText = '✓ Fill Approved Fields';
      fillApprovedBtn.disabled = false;

      const report = injectRes?.report || { successFilled: 0, manualRequired: 0, failedCount: 0 };

      // Render Execution Summary Report
      statDetected.innerText = currentProposals.length;
      statApproved.innerText = approvedList.length;
      statFilled.innerText = report.successFilled;
      statManual.innerText = report.manualRequired;

      proposalReviewPanel.classList.add('hidden');
      scanActionCard.classList.remove('hidden');
      verificationReportCard.classList.remove('hidden');

      showToast(`Successfully filled ${report.successFilled} fields!`);
    } catch (err) {
      fillApprovedBtn.innerText = '✓ Fill Approved Fields';
      fillApprovedBtn.disabled = false;
      showToast('Fill execution failed: ' + err.message);
    }
  });

  // Approve All Toggle
  approveAllBtn.addEventListener('click', () => {
    currentProposals.forEach((p) => (p.approved = true));
    renderProposalsList(currentProposals);
  });

  // Cancel Proposals
  cancelProposalsBtn.addEventListener('click', () => {
    proposalReviewPanel.classList.add('hidden');
    scanActionCard.classList.remove('hidden');
    currentProposals = [];
  });

  function showToast(msg) {
    let text = 'Notification';
    if (typeof msg === 'string') {
      text = msg;
    } else if (msg && typeof msg === 'object') {
      text = msg.detail ? (typeof msg.detail === 'string' ? msg.detail : JSON.stringify(msg.detail)) : JSON.stringify(msg);
    }
    messageToast.innerText = text;
    messageToast.classList.remove('hidden');
    setTimeout(() => messageToast.classList.add('hidden'), 4000);
  }
});
