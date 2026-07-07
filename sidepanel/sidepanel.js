const CONFIG = self.JOB_AUTOFILL_CONFIG;

document.addEventListener('DOMContentLoaded', () => {
  checkState();
  
  document.getElementById('btn-signin').addEventListener('click', () => {
    window.open(`${CONFIG.WEB_APP_URL}/connect`);
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
  const githubLink = document.getElementById('link-github');
  if (githubLink) {
    githubLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://github.com/sheelganvir/1click');
    });
  }

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
    status.innerText = '';
    
    const container = document.getElementById('progress-container');
    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');
    if (container && bar && txt) {
      container.style.display = 'block';
      txt.style.display = 'block';
      bar.style.width = '5%';
      txt.innerText = 'Starting autofill...';
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ type: 'START_AUTOFILL_TAB', tabId: tab.id }, (res) => {
      if (res && res.error) {
        if (txt) {
          txt.innerText = 'Error: ' + res.error;
          txt.style.color = '#dc2626';
        }
        if (bar) bar.style.backgroundColor = '#dc2626';
        setTimeout(() => {
          if (container) container.style.display = 'none';
          if (txt) {
            txt.style.display = 'none';
            txt.style.color = '';
          }
        }, 5000);
      }
    });
  });

  // Settings Panel Toggle
  const toggleBtn = document.getElementById('btn-settings');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const panel = document.getElementById('api-key-panel');
      if (panel) {
        panel.classList.toggle('hidden');
      }
    });
  }

  // Dropdown changes
  const provSelect = document.getElementById('provider-select');
  if (provSelect) {
    provSelect.addEventListener('change', (e) => {
      toggleGroupVisibility(e.target.value, '');
    });
  }
  
  const provSelectNokey = document.getElementById('provider-select-nokey');
  if (provSelectNokey) {
    provSelectNokey.addEventListener('change', (e) => {
      toggleGroupVisibility(e.target.value, '-nokey');
    });
  }

  // Save Buttons
  const saveBtn = document.getElementById('btn-save-keys');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const provider = document.getElementById('provider-select').value;
      const geminiKey = document.getElementById('gemini-key-input').value.trim();
      const groqKey = document.getElementById('groq-key-input').value.trim();
      
      chrome.storage.local.set({ provider, geminiKey, groqKey }, () => {
        const status = document.getElementById('status-msg');
        if (status) {
          status.innerText = 'Key settings saved!';
          status.style.color = '#0B7A2A';
          setTimeout(() => status.innerText = '', 3000);
        }
        // Collapse panel
        const panel = document.getElementById('api-key-panel');
        const chevron = document.getElementById('chevron-settings');
        if (panel) panel.classList.add('hidden');
        if (chevron) chevron.style.transform = '';
        checkState();
      });
    });
  }

  const saveBtnNokey = document.getElementById('btn-save-keys-nokey');
  if (saveBtnNokey) {
    saveBtnNokey.addEventListener('click', () => {
      const provider = document.getElementById('provider-select-nokey').value;
      const geminiKey = document.getElementById('gemini-key-input-nokey').value.trim();
      const groqKey = document.getElementById('groq-key-input-nokey').value.trim();
      
      chrome.storage.local.set({ provider, geminiKey, groqKey }, () => {
        const status = document.getElementById('status-msg');
        if (status) {
          status.innerText = 'API Key saved successfully!';
          status.style.color = '#0B7A2A';
          setTimeout(() => status.innerText = '', 3000);
        }
        checkState();
      });
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'AUTOFILL_PROGRESS') {
    const container = document.getElementById('progress-container');
    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');
    
    if (container && bar && txt) {
      container.style.display = 'block';
      txt.style.display = 'block';
      bar.style.backgroundColor = ''; // Reset error red color if any
      bar.style.width = `${msg.percent}%`;
      txt.innerText = msg.text;
      
      if (msg.percent >= 100) {
        setTimeout(() => {
          container.style.display = 'none';
          txt.style.display = 'none';
          bar.style.width = '0%';
        }, 3000);
      }
    }
  }
});

function getInitials(email) {
  if (!email) return 'SG';
  return email.substring(0, 2).toUpperCase();
}

function loadSettings() {
  chrome.storage.local.get(['provider', 'geminiKey', 'groqKey'], (data) => {
    const provider = data.provider || 'gemini';
    const geminiKey = data.geminiKey || '';
    const groqKey = data.groqKey || '';
    
    // Set ready panel values
    const providerSelect = document.getElementById('provider-select');
    const geminiInput = document.getElementById('gemini-key-input');
    const groqInput = document.getElementById('groq-key-input');
    
    if (providerSelect) providerSelect.value = provider;
    if (geminiInput) geminiInput.value = geminiKey;
    if (groqInput) groqInput.value = groqKey;
    
    // Set no-key panel values
    const providerSelectNokey = document.getElementById('provider-select-nokey');
    const geminiInputNokey = document.getElementById('gemini-key-input-nokey');
    const groqInputNokey = document.getElementById('groq-key-input-nokey');
    
    if (providerSelectNokey) providerSelectNokey.value = provider;
    if (geminiInputNokey) geminiInputNokey.value = geminiKey;
    if (groqInputNokey) groqInputNokey.value = groqKey;
    
    toggleGroupVisibility(provider, '');
    toggleGroupVisibility(provider, '-nokey');
  });
}

function toggleGroupVisibility(provider, suffix) {
  const geminiGroup = document.getElementById(`gemini-key-group${suffix}`);
  const groqGroup = document.getElementById(`groq-key-group${suffix}`);
  
  if (provider === 'gemini') {
    if (geminiGroup) geminiGroup.classList.remove('hidden');
    if (groqGroup) groqGroup.classList.add('hidden');
  } else {
    if (geminiGroup) geminiGroup.classList.add('hidden');
    if (groqGroup) groqGroup.classList.remove('hidden');
  }
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
    
    // Always sync panel fields with newest state
    loadSettings();
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && (changes.session || changes.provider || changes.geminiKey || changes.groqKey)) {
    checkState();
  }
});
