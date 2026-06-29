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
