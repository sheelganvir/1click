const CONFIG = self.JOB_AUTOFILL_CONFIG;

document.addEventListener('DOMContentLoaded', () => {
  checkState();
  
  document.getElementById('btn-signin').addEventListener('click', () => {
    window.open(`${CONFIG.WEB_APP_URL}/connect`);
  });
  
  document.getElementById('btn-add-key').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Dashboard links (both guest and user)
  const dashboardLinks = [document.getElementById('link-dashboard'), document.getElementById('link-dashboard-guest')];
  dashboardLinks.forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`${CONFIG.WEB_APP_URL}/dashboard`);
      });
    }
  });

  document.getElementById('btn-settings').addEventListener('click', () => {
    window.open(`${CONFIG.WEB_APP_URL}/dashboard`);
  });
  
  const signoutLinks = [document.getElementById('link-signout'), document.getElementById('link-signout-guest')];
  signoutLinks.forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, () => {
          checkState();
        });
      });
    }
  });
  
  document.getElementById('btn-sync').addEventListener('click', () => {
    const status = document.getElementById('status-msg');
    status.innerText = 'Syncing profile...';
    status.style.color = '#0B7A2A';
    chrome.runtime.sendMessage({ type: 'REFRESH_PROFILE' }, (res) => {
      if (res && res.error) {
        status.innerText = 'Error: ' + res.error;
        status.style.color = '#dc2626';
      } else {
        status.innerText = 'Profile synced successfully!';
      }
      setTimeout(() => status.innerText = '', 3000);
    });
  });
  
  document.getElementById('btn-parse-jd').addEventListener('click', async () => {
    const status = document.getElementById('status-msg');
    status.innerText = 'Parsing...';
    status.style.color = '#0B7A2A';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ type: 'PARSE_JD_TAB', tabId: tab.id }, (res) => {
      if (res && res.error) {
        status.innerText = 'Error: ' + res.error;
        status.style.color = '#dc2626';
      } else {
        status.innerText = 'JD Parsed!';
      }
      setTimeout(() => status.innerText = '', 3000);
    });
  });
  
  document.getElementById('btn-autofill').addEventListener('click', async () => {
    const status = document.getElementById('status-msg');
    status.innerText = 'Autofilling...';
    status.style.color = '#0B7A2A';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ type: 'START_AUTOFILL_TAB', tabId: tab.id }, (res) => {
      if (res && res.error) {
        status.innerText = 'Error: ' + res.error;
        status.style.color = '#dc2626';
      } else {
        status.innerText = 'Autofill started!';
      }
      setTimeout(() => status.innerText = '', 3000);
    });
  });
});

function getInitials(email) {
  if (!email) return 'SG';
  return email.substring(0, 2).toUpperCase();
}

function checkState() {
  chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (state) => {
    document.getElementById('state-signed-out').classList.add('hidden');
    document.getElementById('state-no-key').classList.add('hidden');
    document.getElementById('state-ready').classList.add('hidden');
    document.getElementById('user-footer').classList.add('hidden');
    document.getElementById('guest-links').classList.add('hidden');
    
    if (!state || !state.signedIn) {
      document.getElementById('state-signed-out').classList.remove('hidden');
      document.getElementById('guest-links').classList.remove('hidden');
      document.getElementById('detective-img').style.display = 'none';
    } else if (!state.hasKey) {
      document.getElementById('state-no-key').classList.remove('hidden');
      document.getElementById('user-footer').classList.remove('hidden');
      document.getElementById('user-email').innerText = state.email;
      document.getElementById('user-initials').innerText = getInitials(state.email);
      document.getElementById('detective-img').style.display = 'block';
    } else {
      document.getElementById('state-ready').classList.remove('hidden');
      document.getElementById('user-footer').classList.remove('hidden');
      document.getElementById('user-email').innerText = state.email;
      document.getElementById('user-initials').innerText = getInitials(state.email);
      document.getElementById('detective-img').style.display = 'block';
    }
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && (changes.session || changes.provider || changes.geminiKey || changes.groqKey)) {
    checkState();
  }
});
