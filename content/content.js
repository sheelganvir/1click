// content.js
let seenElements = new WeakSet();
let autofillActive = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PAGE_TEXT') {
    sendResponse({ text: document.body.innerText, title: document.title, url: location.href });
    return;
  }
  if (msg.type === 'EXTRACT_FIELDS') {
    autofillActive = true;
    extractAndFill();
    sendResponse({ ok: true });
    return;
  }
});

function getLabel(el) {
  if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
  if (el.id) {
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl) return labelEl.innerText;
  }
  const parentLabel = el.closest('label');
  if (parentLabel) {
    const clone = parentLabel.cloneNode(true);
    const input = clone.querySelector('input, select, textarea');
    if (input) input.remove();
    return clone.innerText.trim();
  }
  return el.placeholder || el.name || '';
}

function getOptions(el) {
  if (el.tagName === 'SELECT') {
    return Array.from(el.options).map(o => o.text);
  }
  return [];
}

async function extractAndFill(root = document) {
  const inputs = Array.from(root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea, [contenteditable="true"]'));
  const fields = [];
  
  inputs.forEach((el, i) => {
    if (seenElements.has(el)) return;
    seenElements.add(el);
    
    // Generate a temporary ID if none exists to map back
    if (!el.dataset.autofillId) {
      el.dataset.autofillId = 'field_' + Math.random().toString(36).substr(2, 9);
    }
    
    fields.push({
      id: el.dataset.autofillId,
      name: el.name || '',
      type: el.type || el.tagName.toLowerCase(),
      placeholder: el.placeholder || '',
      label: getLabel(el),
      options: getOptions(el)
    });
  });
  
  if (fields.length === 0) return;
  
  chrome.runtime.sendMessage({ type: 'MATCH_FIELDS', fields }, (response) => {
    if (response && response.matched) {
      fillFields(response.matched, root);
    }
  });
}

function fillFields(matched, root) {
  for (const [id, value] of Object.entries(matched)) {
    if (!value) continue;
    const el = root.querySelector(`[data-autofill-id="${id}"]`);
    if (el) {
      injectValue(el, value);
    }
  }
}

function injectValue(el, value) {
  if (el.tagName === 'SELECT') {
    const options = Array.from(el.options);
    const target = options.find(o => o.text.toLowerCase().includes(value.toLowerCase()) || o.value.toLowerCase() === value.toLowerCase());
    if (target) {
      el.value = target.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (el.type === 'checkbox' || el.type === 'radio') {
    if (value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'yes' || el.value.toLowerCase() === value.toLowerCase()) {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (el.isContentEditable) {
    el.innerText = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // React/Vue safe injection
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    
    if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(el, value);
    } else if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// Observe for new fields (e.g. SPAs, multi-step forms)
const observer = new MutationObserver((mutations) => {
  if (!autofillActive) return;
  
  let hasNewNodes = false;
  for (const m of mutations) {
    if (m.addedNodes.length > 0) {
      hasNewNodes = true;
      break;
    }
  }
  if (hasNewNodes) {
    // Debounce extraction
    clearTimeout(window.autofillDebounce);
    window.autofillDebounce = setTimeout(() => extractAndFill(document), 1000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

if (window === window.top) {
  if (document.body) {
    injectFloatingWidget();
  } else {
    document.addEventListener('DOMContentLoaded', injectFloatingWidget);
  }
}

function injectFloatingWidget() {
  const container = document.createElement('div');
  container.id = 'oneclick-floating-widget-root';
  const shadow = container.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :host {
      --primary: #0B7A2A;
      --primary-hover: #06561C;
      --bg-light: #f2fbf4;
      --text-dark: #111;
      --text-gray: #6b7280;
      --border-color: #f3f4f6;
    }
    
    .widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    .floating-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #06561C);
      color: white;
      border: 2px solid white;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .floating-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(11, 122, 42, 0.3);
    }
    
    .floating-btn:active {
      transform: scale(0.95);
    }
    
    .floating-btn svg {
      width: 24px;
      height: 24px;
    }
    
    .widget-card {
      width: 320px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border: 1px solid #e5e7eb;
      margin-bottom: 12px;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .header-area {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .title-row h1 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.02em;
    }
    
    .title-row h1 span {
      color: var(--primary);
    }
    
    .close-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--text-gray);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .close-btn:hover {
      background: #f3f4f6;
      color: var(--text-dark);
    }
    
    .close-btn svg {
      width: 16px;
      height: 16px;
    }
    
    .state-view {
      padding: 16px;
    }
    
    .hidden {
      display: none !important;
    }
    
    .welcome-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 12px 0;
    }
    
    .user-avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--bg-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .welcome-section h2 {
      margin: 0 0 4px 0;
      font-size: 1.05rem;
      font-weight: 800;
    }
    
    .welcome-section p {
      margin: 0 0 16px 0;
      font-size: 0.78rem;
      color: #4b5563;
      line-height: 1.4;
    }
    
    .btn {
      width: 100%;
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      border: none;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 6px rgba(11, 122, 42, 0.15);
    }
    
    .btn-primary:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    
    .btn-outline {
      background: white;
      border: 1px solid #e5e7eb;
      color: var(--text-dark);
    }
    
    .btn-outline:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .action-btn {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      border: 1px solid #e5e7eb;
      background: white;
    }
    
    .action-btn:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }
    
    .action-btn.fill {
      background: var(--primary);
      border-color: var(--primary-hover);
      color: white;
    }
    
    .action-btn.fill:hover {
      background: var(--primary-hover);
    }
    
    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: 10px;
    }
    
    .bg-light-green {
      background: var(--bg-light);
    }
    
    .bg-dark-green {
      background: #1B5E20;
    }
    
    .btn-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .btn-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-dark);
    }
    
    .action-btn.fill .btn-title {
      color: white;
    }
    
    .btn-desc {
      font-size: 0.68rem;
      color: var(--text-gray);
      font-weight: 500;
    }
    
    .action-btn.fill .btn-desc {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .chevron {
      flex-shrink: 0;
      margin-left: 4px;
      opacity: 0.5;
    }
    
    .status-msg {
      text-align: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      min-height: 1.2em;
      margin-top: 4px;
    }
    
    .user-footer {
      border-top: 1px solid var(--border-color);
      padding: 10px 16px;
      background: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #D2EDD0;
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
    }
    
    .user-email {
      font-size: 0.75rem;
      font-weight: 700;
      color: #374151;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .footer-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .settings-btn {
      background: none;
      border: none;
      padding: 6px;
      cursor: pointer;
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .settings-btn:hover {
      background: var(--bg-light);
    }
    
    .settings-btn svg {
      width: 16px;
      height: 16px;
    }
    
    .signout-link {
      color: var(--text-gray);
      text-decoration: none;
      font-size: 0.72rem;
      font-weight: 600;
      transition: color 0.2s;
      cursor: pointer;
    }
    
    .signout-link:hover {
      color: #dc2626;
    }
  `;
  shadow.appendChild(style);
  
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'widget-container';
  
  widgetContainer.innerHTML = `
    <div class="widget-card" id="widget-card">
      <div class="header-area">
        <div class="logo-section">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          <div class="title-row">
            <h1><span>1</span>Click Jobs</h1>
          </div>
        </div>
        <button class="close-btn" id="widget-close" title="Close Panel">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div id="w-signed-out" class="state-view hidden">
        <div class="welcome-section">
          <div class="user-avatar-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2>Welcome!</h2>
          <p>Sign in to sync your profile and resume.</p>
          <button class="btn btn-primary" id="w-btn-signin">Sign in / Sign up</button>
        </div>
      </div>
      
      <div id="w-no-key" class="state-view hidden">
        <div class="welcome-section">
          <div class="user-avatar-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          </div>
          <h2>API Key Required</h2>
          <p>Please add your AI API key in extension settings.</p>
          <button class="btn btn-primary" id="w-btn-add-key">Add AI Key</button>
        </div>
      </div>
      
      <div id="w-ready" class="state-view hidden">
        <div class="action-buttons">
          <button class="action-btn" id="w-btn-sync">
            <div class="btn-icon bg-light-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </div>
            <div class="btn-text">
              <span class="btn-title">Sync Profile</span>
              <span class="btn-desc">Keep your profile up to date</span>
            </div>
          </button>
          
          <button class="action-btn" id="w-btn-parse">
            <div class="btn-icon bg-light-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div class="btn-text">
              <span class="btn-title">Parse JD</span>
              <span class="btn-desc">Extract key details from job description</span>
            </div>
          </button>
          
          <button class="action-btn fill" id="w-btn-autofill">
            <div class="btn-icon bg-dark-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/></svg>
            </div>
            <div class="btn-text">
              <span class="btn-title">Autofill</span>
              <span class="btn-desc">Fill applications in one click</span>
            </div>
          </button>
          
          <div class="status-msg" id="w-status-msg"></div>
        </div>
      </div>
      
      <div class="user-footer hidden" id="w-footer">
        <div class="user-info">
          <div class="user-avatar" id="w-user-initials">SH</div>
          <div class="user-email" id="w-user-email">email@example.com</div>
        </div>
        <div class="footer-actions">
          <button class="settings-btn" id="w-btn-settings" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <a class="signout-link" id="w-link-signout">Sign out</a>
        </div>
      </div>
    </div>
    
    <button class="floating-btn" id="widget-trigger" title="1Click Autofill Panel">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
    </button>
  `;
  
  shadow.appendChild(widgetContainer);
  document.body.appendChild(container);
  
  const triggerBtn = shadow.getElementById('widget-trigger');
  const card = shadow.getElementById('widget-card');
  const closeBtn = shadow.getElementById('widget-close');
  
  const signedOutView = shadow.getElementById('w-signed-out');
  const noKeyView = shadow.getElementById('w-no-key');
  const readyView = shadow.getElementById('w-ready');
  const userFooter = shadow.getElementById('w-footer');
  
  const statusMsg = shadow.getElementById('w-status-msg');
  const userInitials = shadow.getElementById('w-user-initials');
  const userEmail = shadow.getElementById('w-user-email');
  
  triggerBtn.addEventListener('click', () => {
    const isVisible = card.style.display === 'flex';
    if (isVisible) {
      card.style.display = 'none';
    } else {
      card.style.display = 'flex';
      updateWidgetState();
    }
  });
  
  closeBtn.addEventListener('click', () => {
    card.style.display = 'none';
  });
  
  shadow.getElementById('w-btn-signin').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  });
  
  shadow.getElementById('w-btn-add-key').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
  });
  
  shadow.getElementById('w-btn-settings').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  });
  
  shadow.getElementById('w-link-signout').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, () => {
      updateWidgetState();
    });
  });
  
  shadow.getElementById('w-btn-sync').addEventListener('click', () => {
    statusMsg.innerText = 'Syncing...';
    statusMsg.style.color = '#0B7A2A';
    chrome.runtime.sendMessage({ type: 'REFRESH_PROFILE' }, (res) => {
      if (res && res.error) {
        statusMsg.innerText = 'Error: ' + res.error;
        statusMsg.style.color = '#dc2626';
      } else {
        statusMsg.innerText = 'Profile synced!';
        updateWidgetState();
      }
      setTimeout(() => statusMsg.innerText = '', 3000);
    });
  });
  
  shadow.getElementById('w-btn-parse').addEventListener('click', () => {
    statusMsg.innerText = 'Parsing JD...';
    statusMsg.style.color = '#0B7A2A';
    chrome.runtime.sendMessage({ type: 'PARSE_JD_CURRENT' }, (res) => {
      if (res && res.error) {
        statusMsg.innerText = 'Error: ' + res.error;
        statusMsg.style.color = '#dc2626';
      } else {
        statusMsg.innerText = 'JD Parsed!';
      }
      setTimeout(() => statusMsg.innerText = '', 3000);
    });
  });
  
  shadow.getElementById('w-btn-autofill').addEventListener('click', () => {
    statusMsg.innerText = 'Autofilling...';
    statusMsg.style.color = '#0B7A2A';
    autofillActive = true;
    extractAndFill(document);
    statusMsg.innerText = 'Autofill started!';
    setTimeout(() => statusMsg.innerText = '', 3000);
  });
  
  function updateWidgetState() {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (state) => {
      signedOutView.classList.add('hidden');
      noKeyView.classList.add('hidden');
      readyView.classList.add('hidden');
      userFooter.classList.add('hidden');
      
      if (!state || !state.signedIn) {
        signedOutView.classList.remove('hidden');
      } else if (!state.hasKey) {
        noKeyView.classList.remove('hidden');
        userFooter.classList.remove('hidden');
        userEmail.innerText = state.email || '';
        userInitials.innerText = (state.email || 'SH').substring(0, 2).toUpperCase();
      } else {
        readyView.classList.remove('hidden');
        userFooter.classList.remove('hidden');
        userEmail.innerText = state.email || '';
        userInitials.innerText = (state.email || 'SH').substring(0, 2).toUpperCase();
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (changes.session || changes.provider || changes.geminiKey || changes.groqKey)) {
      updateWidgetState();
    }
  });
}
