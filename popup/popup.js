const CONFIG = self.JOB_AUTOFILL_CONFIG;

document.addEventListener('DOMContentLoaded', () => {
  checkState();
  
  document.getElementById('btn-signin').addEventListener('click', () => {
    window.open(`${CONFIG.WEB_APP_URL}/connect`);
  });
  
  document.getElementById('btn-add-key').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('link-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    window.open(`${CONFIG.WEB_APP_URL}/dashboard`);
  });
  
  document.getElementById('link-signout').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, () => {
      checkState();
    });
  });
  
  document.getElementById('btn-sync').addEventListener('click', () => {
    const status = document.getElementById('status-msg');
    status.innerText = 'Syncing profile...';
    chrome.runtime.sendMessage({ type: 'REFRESH_PROFILE' }, (res) => {
      if (res && res.error) status.innerText = 'Error: ' + res.error;
      else status.innerText = 'Profile synced successfully!';
    });
  });
  
  document.getElementById('btn-parse-jd').addEventListener('click', async () => {
    const status = document.getElementById('status-msg');
    status.innerText = 'Parsing...';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ type: 'PARSE_JD_TAB', tabId: tab.id }, (res) => {
      if (res && res.error) status.innerText = 'Error: ' + res.error;
      else status.innerText = 'JD Parsed!';
    });
  });
  
  document.getElementById('btn-autofill').addEventListener('click', async () => {
    const status = document.getElementById('status-msg');
    status.innerText = 'Autofilling...';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ type: 'START_AUTOFILL_TAB', tabId: tab.id }, (res) => {
      if (res && res.error) status.innerText = 'Error: ' + res.error;
      else status.innerText = 'Autofill started!';
    });
  });
});

function checkState() {
  chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (state) => {
    document.getElementById('state-signed-out').classList.add('hidden');
    document.getElementById('state-no-key').classList.add('hidden');
    document.getElementById('state-ready').classList.add('hidden');
    document.getElementById('footer').classList.add('hidden');
    
    if (!state.signedIn) {
      document.getElementById('state-signed-out').classList.remove('hidden');
    } else if (!state.hasKey) {
      document.getElementById('state-no-key').classList.remove('hidden');
      document.getElementById('footer').classList.remove('hidden');
      document.getElementById('user-email').innerText = state.email;
    } else {
      document.getElementById('state-ready').classList.remove('hidden');
      document.getElementById('footer').classList.remove('hidden');
      document.getElementById('user-email').innerText = state.email;
    }
  });
}
