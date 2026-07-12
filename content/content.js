let seenElements = new WeakSet();

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

function formatForMonthInput(val) {
  if (!val) return '';
  const str = val.toString().trim();
  if (/^\d{4}-\d{2}$/.test(str)) {
    return str;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str.substring(0, 7);
  }
  
  let year = null;
  let month = '01';
  
  const yearMatch = str.match(/\b\d{4}\b/);
  if (yearMatch) {
    year = yearMatch[0];
  }
  
  const monthsMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };
  
  const words = str.toLowerCase().split(/[\s,.\-\/]+/);
  for (const word of words) {
    if (monthsMap[word]) {
      month = monthsMap[word];
      break;
    }
    if (/^\d{1,2}$/.test(word)) {
      const num = parseInt(word, 10);
      if (num >= 1 && num <= 12 && word !== year) {
        month = num.toString().padStart(2, '0');
      }
    }
  }
  
  if (!year) {
    const parts = str.split(/[\s\-\/]+/);
    if (parts.length === 2) {
      const p0 = parts[0];
      const p1 = parts[1];
      if (/^\d{4}$/.test(p1)) {
        year = p1;
        month = p0.padStart(2, '0');
      } else if (/^\d{4}$/.test(p0)) {
        year = p0;
        month = p1.padStart(2, '0');
      } else if (/^\d{2}$/.test(p1)) {
        year = '20' + p1;
        month = p0.padStart(2, '0');
      }
    }
  }
  
  if (!year) {
    year = new Date().getFullYear().toString();
  }
  
  return `${year}-${month}`;
}

function formatForDateInput(val) {
  if (!val) return '';
  const str = val.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  if (/^\d{4}-\d{2}$/.test(str)) {
    return `${str}-01`;
  }
  const monthStr = formatForMonthInput(str);
  return `${monthStr}-01`;
}

function formatForWeekInput(val) {
  if (!val) return '';
  const str = val.toString().trim();
  if (/^\d{4}-W\d{2}$/i.test(str)) {
    return str.toUpperCase();
  }
  
  let year = new Date().getFullYear();
  let week = 1;
  
  const parsedDate = Date.parse(str);
  if (!isNaN(parsedDate)) {
    const dateObj = new Date(parsedDate);
    year = dateObj.getFullYear();
    dateObj.setHours(0, 0, 0, 0);
    dateObj.setDate(dateObj.getDate() + 4 - (dateObj.getDay() || 7));
    const yearStart = new Date(dateObj.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((dateObj.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    week = weekNo;
  } else {
    const numMatch = str.match(/\b\d{1,2}\b/);
    if (numMatch) {
      week = parseInt(numMatch[0], 10);
      if (week < 1) week = 1;
      if (week > 53) week = 53;
    }
    const yearMatch = str.match(/\b\d{4}\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[0], 10);
    }
  }
  
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function formatForTimeInput(val) {
  if (!val) return '';
  const str = val.toString().trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    return str;
  }
  const timeMatch = str.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const ampm = timeMatch[3];
    if (ampm) {
      if (ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return str;
}

function injectValue(el, value) {
  if (value === undefined || value === null) return;
  const valStr = value.toString();

  if (el.tagName === 'SELECT') {
    const options = Array.from(el.options);
    const target = options.find(o => o.text.toLowerCase().includes(valStr.toLowerCase()) || o.value.toLowerCase() === valStr.toLowerCase());
    if (target) {
      el.value = target.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      debugLog(`[Select] Set to option: "${target.text}"`);
    } else {
      debugLog(`[Select] Could not find option matching: "${valStr}"`);
    }
  } else if (el.type === 'checkbox' || el.type === 'radio') {
    const valLower = valStr.toLowerCase();
    const elVal = el.value.toLowerCase();
    const baseLabel = getLabel(el).split(' - ').pop().toLowerCase();
    
    const isMatched = (
      valLower === 'true' || 
      valLower === 'yes' || 
      elVal === valLower ||
      baseLabel.includes(valLower) ||
      valLower.includes(baseLabel)
    );
    
    debugLog(`[Choice] Type: ${el.type}, valLower: "${valLower}", elVal: "${elVal}", baseLabel: "${baseLabel}", isMatched: ${isMatched}`);
    
    if (isMatched && !el.checked) {
      el.click();
      debugLog(`[Choice] Clicked to CHECK.`);
    } else if (!isMatched && el.checked && el.type === 'checkbox') {
      el.click();
      debugLog(`[Choice] Clicked to UNCHECK.`);
    }
  } else if (el.isContentEditable) {
    el.innerText = valStr;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    debugLog(`[ContentEditable] Filled value.`);
  } else {
    if (el.type === 'file') {
      try {
        const filename = valStr.split(/[\\/]/).pop() || 'resume.pdf';
        const dt = new DataTransfer();
        dt.items.add(new File(["Mock file content for testing autofill"], filename, { type: "application/pdf" }));
        el.files = dt.files;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        debugLog(`[File] Injected mock file: "${filename}"`);
        return;
      } catch (err) {
        debugLog(`[File] Failed to inject mock file: ${err.message}`);
      }
    }

    let finalValue = valStr;
    if (el.type === 'month') {
      finalValue = formatForMonthInput(valStr);
    } else if (el.type === 'date') {
      finalValue = formatForDateInput(valStr);
    } else if (el.type === 'week') {
      finalValue = formatForWeekInput(valStr);
    } else if (el.type === 'time') {
      finalValue = formatForTimeInput(valStr);
    }
    
    // React/Vue safe injection
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    
    if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(el, finalValue);
    } else if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, finalValue);
    } else {
      el.value = finalValue;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    debugLog(`[Text/Input] Set value: "${finalValue}" (original: "${valStr}").`);
  }
}

