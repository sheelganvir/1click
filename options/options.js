const CONFIG = self.JOB_AUTOFILL_CONFIG;

document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('provider');
  const geminiSettings = document.getElementById('gemini-settings');
  const groqSettings = document.getElementById('groq-settings');
  const geminiKey = document.getElementById('gemini-key');
  const groqKey = document.getElementById('groq-key');
  const groqModel = document.getElementById('groq-model');
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');
  
  chrome.storage.local.get(['provider', 'geminiKey', 'groqKey', 'groqModel'], (data) => {
    if (data.provider) providerSelect.value = data.provider;
    if (data.geminiKey) geminiKey.value = data.geminiKey;
    if (data.groqKey) groqKey.value = data.groqKey;
    if (data.groqModel) groqModel.value = data.groqModel;
    updateVisibility();
  });
  
  providerSelect.addEventListener('change', updateVisibility);
  
  function updateVisibility() {
    if (providerSelect.value === 'gemini') {
      geminiSettings.classList.remove('hidden');
      groqSettings.classList.add('hidden');
    } else {
      geminiSettings.classList.add('hidden');
      groqSettings.classList.remove('hidden');
    }
  }
  
  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({
      provider: providerSelect.value,
      geminiKey: geminiKey.value.trim(),
      groqKey: groqKey.value.trim(),
      groqModel: groqModel.value
    }, () => {
      status.innerText = 'Saved!';
      setTimeout(() => status.innerText = '', 2000);
    });
  });
  
  updateAccount();
});

function updateAccount() {
  chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (state) => {
    const div = document.getElementById('account-info');
    if (state.signedIn) {
      div.innerHTML = `
        <p>Signed in as: <strong>${state.email}</strong></p>
        <button id="btn-dashboard" style="background: #f3f4f6; color: #374151; margin-right: 10px;">Open Dashboard</button>
        <button id="btn-signout" style="background: #ef4444;">Sign Out</button>
      `;
      document.getElementById('btn-dashboard').addEventListener('click', () => {
        window.open(`${CONFIG.WEB_APP_URL}/dashboard`);
      });
      document.getElementById('btn-signout').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, updateAccount);
      });
    } else {
      div.innerHTML = `
        <p>Not signed in.</p>
        <button id="btn-signin">Sign in / Sign up</button>
      `;
      document.getElementById('btn-signin').addEventListener('click', () => {
        window.open(`${CONFIG.WEB_APP_URL}/connect`);
      });
    }
  });
}
