// content.js
let seenElements = new WeakSet();
let autofillActive = false;

function debugLog(msg) {
  console.log('[1Click Debug]', msg);
  const logOverlay = document.getElementById('oneclick-debug-logs');
  if (logOverlay) {
    const p = document.createElement('p');
    p.style.margin = '3px 0';
    p.style.borderBottom = '1px solid rgba(0,255,0,0.1)';
    p.style.paddingBottom = '3px';
    p.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logOverlay.appendChild(p);
    logOverlay.scrollTop = logOverlay.scrollHeight;
  }
}

if (location.href.includes('sample-form.html')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugOverlay);
  } else {
    initDebugOverlay();
  }
}

function initDebugOverlay() {
  if (document.getElementById('oneclick-debug-overlay')) return;
  const logDiv = document.createElement('div');
  logDiv.id = 'oneclick-debug-overlay';
  logDiv.style.cssText = 'position: fixed; bottom: 20px; left: 20px; width: 480px; height: 320px; background: rgba(15,23,42,0.95); color: #22c55e; font-family: monospace; font-size: 11px; padding: 12px; overflow: hidden; z-index: 999999; border-radius: 12px; border: 1.5px solid #22c55e; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4); display: flex; flex-direction: column;';
  
  const header = document.createElement('div');
  header.style.cssText = 'font-weight: 800; border-bottom: 1.5px solid #22c55e; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: white;';
  header.innerHTML = '<span>⚡ 1CLICK AUTOFILL DEBUG CONSOLE</span><span style="cursor:pointer;color:#ef4444;font-size:14px;font-weight:bold;" onclick="document.getElementById(\'oneclick-overlay-container\').remove()">✕</span>';
  logDiv.appendChild(header);
  
  const contentArea = document.createElement('div');
  contentArea.id = 'oneclick-debug-logs';
  contentArea.style.cssText = 'flex: 1; overflow-y: auto; padding-right: 4px;';
  logDiv.appendChild(contentArea);
  
  const container = document.createElement('div');
  container.id = 'oneclick-overlay-container';
  container.appendChild(logDiv);
  document.body.appendChild(container);
  
  debugLog("Debug Console initialized.");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PAGE_TEXT') {
    sendResponse({ text: document.body.innerText, title: document.title, url: location.href });
    return;
  }
  if (msg.type === 'EXTRACT_FIELDS') {
    debugLog("Manual autofill triggered. Resetting element cache.");
    seenElements = new WeakSet();
    autofillActive = true;
    extractAndFill();
    sendResponse({ ok: true });
    return;
  }
});

function getGroupLabel(el) {
  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) return legend.innerText.trim();
  }
  
  let parent = el.parentElement;
  for (let i = 0; i < 3; i++) {
    if (!parent || parent === document.body) break;
    const siblingLabel = parent.querySelector('label:not(.field-row)');
    if (siblingLabel && siblingLabel !== el.closest('label')) {
      return siblingLabel.innerText.trim();
    }
    const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, .field-title, .form-section-title');
    if (heading) {
      return heading.innerText.trim();
    }
    parent = parent.parentElement;
  }
  return '';
}

function getLabel(el) {
  let baseLabel = '';
  if (el.getAttribute('aria-label')) {
    baseLabel = el.getAttribute('aria-label');
  } else if (el.id) {
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl) baseLabel = labelEl.innerText;
  }
  
  if (!baseLabel) {
    const parentLabel = el.closest('label');
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true);
      const input = clone.querySelector('input, select, textarea');
      if (input) input.remove();
      baseLabel = clone.innerText.trim();
    }
  }
  
  if (!baseLabel) {
    baseLabel = el.placeholder || el.name || '';
  }
  
  if (el.type === 'radio' || el.type === 'checkbox') {
    const groupLabel = getGroupLabel(el);
    if (groupLabel && groupLabel.toLowerCase() !== baseLabel.toLowerCase()) {
      return `${groupLabel} - ${baseLabel}`;
    }
  }
  
  return baseLabel;
}

function getOptions(el) {
  if (el.tagName === 'SELECT') {
    return Array.from(el.options).map(o => o.text);
  }
  return [];
}

async function extractAndFill(root = document) {
  debugLog("Scanning DOM for input elements...");
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
  
  debugLog(`Found ${fields.length} new inputs to match.`);
  if (fields.length === 0) return;
  
  debugLog("Sending MATCH_FIELDS request to background script...");
  chrome.runtime.sendMessage({ type: 'AUTOFILL_PROGRESS', percent: 15, text: 'Scanning page...' });
  chrome.runtime.sendMessage({ type: 'MATCH_FIELDS', fields }, (response) => {
    if (response && response.error) {
      debugLog(`Error from matcher: ${response.error}`);
    } else if (response && response.matched) {
      debugLog(`Received matches: ${JSON.stringify(response.matched)}`);
      fillFields(response.matched, root);
    } else {
      debugLog("No response received from matcher.");
    }
  });
}

function fillFields(matched, root) {
  chrome.runtime.sendMessage({ type: 'AUTOFILL_PROGRESS', percent: 80, text: 'Injecting values...' });
  let count = 0;
  for (const [id, value] of Object.entries(matched)) {
    if (!value) continue;
    const el = root.querySelector(`[data-autofill-id="${id}"]`);
    if (el) {
      try {
        debugLog(`Filling: [Label: "${getLabel(el)}"] ──> Value: "${value}"`);
        injectValue(el, value);
        count++;
      } catch (err) {
        debugLog(`Error filling field [Label: "${getLabel(el)}"]: ${err.message || err}`);
        console.error('Failed to fill field', el, err);
      }
    } else {
      debugLog(`Element not found in DOM for ID: ${id}`);
    }
  }
  debugLog(`Filled ${count} fields.`);
  chrome.runtime.sendMessage({ type: 'AUTOFILL_PROGRESS', percent: 100, text: 'Form filled successfully!' });
}

function injectValue(el, value) {
  if (el.tagName === 'SELECT') {
    const options = Array.from(el.options);
    const target = options.find(o => o.text.toLowerCase().includes(value.toLowerCase()) || o.value.toLowerCase() === value.toLowerCase());
    if (target) {
      el.value = target.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      debugLog(`[Select] Set to option: "${target.text}"`);
    } else {
      debugLog(`[Select] Could not find option matching: "${value}"`);
    }
  } else if (el.type === 'checkbox' || el.type === 'radio') {
    const valStr = value.toString().toLowerCase();
    const elVal = el.value.toLowerCase();
    const baseLabel = getLabel(el).split(' - ').pop().toLowerCase();
    
    const isMatched = (
      valStr === 'true' || 
      valStr === 'yes' || 
      elVal === valStr ||
      baseLabel.includes(valStr) ||
      valStr.includes(baseLabel)
    );
    
    debugLog(`[Choice] Type: ${el.type}, valStr: "${valStr}", elVal: "${elVal}", baseLabel: "${baseLabel}", isMatched: ${isMatched}`);
    
    if (isMatched && !el.checked) {
      el.click();
      debugLog(`[Choice] Clicked to CHECK.`);
    } else if (!isMatched && el.checked && el.type === 'checkbox') {
      el.click();
      debugLog(`[Choice] Clicked to UNCHECK.`);
    }
  } else if (el.isContentEditable) {
    el.innerText = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    debugLog(`[ContentEditable] Filled value.`);
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
    debugLog(`[Text/Input] Set value.`);
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
