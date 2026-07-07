importScripts('../config.js');
const CONFIG = self.JOB_AUTOFILL_CONFIG;
 
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

const PROVIDERS = {
  gemini: {
    keyField: 'geminiKey',
    modelField: 'geminiModel',
    label: 'Gemini',
    models: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
  },
  groq: {
    keyField: 'groqKey',
    modelField: 'groqModel',
    label: 'Groq',
    models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768']
  }
};

let cloudProfile = null; // { profile, resumeText, fetchedAt }

// Rule-based matching for standard fields
const RULES = [
  // Specific nested fields first (highest priority)
  { regex: /\b(college|university|school|institute)\b/i, field: 'education.0.collegeName' },
  { regex: /\b(degree|accreditation)\b/i, field: 'education.0.degree' },
  { regex: /\b(branch|specialization|major)\b/i, field: 'education.0.branch' },
  { regex: /\bgpa\b/i, field: 'education.0.gpa' },
  { regex: /\b(company|employer)\b/i, field: 'workExperience.0.company' },
  { regex: /\b(job title|role)\b/i, field: 'workExperience.0.jobTitle' },

  // Links
  { regex: /\blinkedin\b/i, field: 'linkedin' },
  { regex: /\bgithub\b/i, field: 'github' },
  { regex: /\b(x|twitter)\b/i, field: 'x' },
  { regex: /\bmedium\b/i, field: 'medium' },
  { regex: /\bleetcode\b/i, field: 'leetcode' },
  { regex: /\b(gfg|geeksforgeeks)\b/i, field: 'gfg' },
  { regex: /\b(website|portfolio)\b/i, field: 'website' },

  // Personal Info
  { regex: /\bfirst.*name\b/i, field: 'firstName' },
  { regex: /\blast.*name\b/i, field: 'lastName' },
  { regex: /^(name|full name)$/i, field: 'firstName' }, // fallback
  { regex: /\bemail\b/i, field: 'email' },
  { regex: /\b(phone|mobile)\b/i, field: 'phone' },
  { regex: /\b(dob|birth|date of birth)\b/i, field: 'dateOfBirth' },

  // Other specific
  { regex: /\b(achievements|awards|honors)\b/i, field: 'achievements' },
  { regex: /\btitle\b/i, field: 'currentTitle' },

  // Address (Generic, put last so they don't override specific ones like "Company City")
  { regex: /\baddress\b/i, field: 'address' },
  { regex: /\b(city|town|hometown|location)\b/i, field: 'city' },
  { regex: /\bstate\b/i, field: 'state' },
  { regex: /\b(zip|postal|pincode)\b/i, field: 'zip' },
  { regex: /\bcountry\b/i, field: 'country' },
  { regex: /\b(nationality|citizenship)\b/i, field: 'nationality' },
  
  // Work Auth
  { regex: /\b(authorized.*india|work.*india|right to work.*india)\b/i, field: 'workAuthIndia' },
  { regex: /\b(sponsor|sponsorship)\b/i, field: 'requireSponsorship' }
];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_AUTH_STATE') {
    chrome.storage.local.get(['session', 'provider', 'geminiKey', 'groqKey'], (data) => {
      const hasKey = data.provider === 'groq' ? !!data.groqKey : !!data.geminiKey;
      sendResponse({
        signedIn: !!data.session,
        email: data.session?.email,
        hasKey: hasKey,
        provider: data.provider || 'gemini'
      });
    });
    return true;
  }
  if (msg.type === 'SIGN_OUT') {
    chrome.storage.local.remove(['session']);
    cloudProfile = null;
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'REFRESH_PROFILE') {
    fetchProfile().then(() => sendResponse({ ok: true })).catch(e => sendResponse({ error: e.message }));
    return true;
  }
  if (msg.type === 'START_AUTOFILL_TAB') {
    startAutofill(msg.tabId).then(res => sendResponse(res)).catch(e => sendResponse({ error: e.message }));
    return true;
  }
  if (msg.type === 'PARSE_JD_TAB') {
    parseJdTab(msg.tabId).then(res => sendResponse(res)).catch(e => sendResponse({ error: e.message }));
    return true;
  }
  if (msg.type === 'PARSE_JD_CURRENT') {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      parseJdTab(tabId).then(res => sendResponse(res)).catch(e => sendResponse({ error: e.message }));
    } else {
      sendResponse({ error: 'No active tab found' });
    }
    return true;
  }
  if (msg.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: `${CONFIG.WEB_APP_URL}/dashboard` });
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'MATCH_FIELDS') {
    handleMatchFields(msg.fields).then(res => sendResponse(res)).catch(e => sendResponse({ error: e.message }));
    return true;
  }
});

chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SESSION' && msg.session) {
    chrome.storage.local.set({ session: msg.session }, () => {
      fetchProfile().catch(console.error);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'PARSE_RESUME_TO_PROFILE' && msg.text) {
    parseResumeToProfile(msg.text)
      .then(profile => sendResponse({ ok: true, profile }))
      .catch(e => sendResponse({ error: e.message }));
    return true;
  }
});

async function getValidAccessToken() {
  const data = await chrome.storage.local.get('session');
  if (!data.session) throw new Error('Not signed in');
  let { accessToken, refreshToken, expiresAt, email } = data.session;
  
  if (Date.now() > expiresAt - 60000) {
    const res = await fetch(`${CONFIG.WEB_APP_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) {
      await chrome.storage.local.remove('session');
      cloudProfile = null;
      throw new Error('Session expired');
    }
    const json = await res.json();
    accessToken = json.access_token;
    refreshToken = json.refresh_token;
    expiresAt = Date.now() + (json.expires_in * 1000);
    await chrome.storage.local.set({ session: { accessToken, refreshToken, expiresAt, email } });
  }
  return accessToken;
}

async function fetchProfile() {
  const token = await getValidAccessToken();
  const res = await fetch(`${CONFIG.WEB_APP_URL}/api/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  const row = await res.json();
  if (!row || Object.keys(row).length === 0) throw new Error('Profile not found');
  const profile = {
    firstName: row.first_name || '',
    middleName: row.middle_name || '',
    lastName: row.last_name || '',
    preferredFirstName: row.preferred_first_name || '',
    preferredMiddleName: row.preferred_middle_name || '',
    preferredLastName: row.preferred_last_name || '',
    email: row.email || '',
    phoneType: row.phone_type || '',
    countryCode: row.country_code || '',
    phone: row.phone || '',
    address: row.address || '',
    city: row.city || '',
    nationality: row.nationality || '',
    state: row.state || '',
    zip: row.zip || '',
    country: row.country || '',
    linkedin: row.linkedin || '',
    github: row.github || '',
    website: row.website || '',
    x: row.x || '',
    medium: row.medium || '',
    leetcode: row.leetcode || '',
    gfg: row.gfg || '',
    education: row.education || [],
    workExperience: row.work_experience || [],
    skills: row.skills || [],
    languages: row.languages || [],
    certificates: row.certificates || [],
    workAuthIndia: row.work_auth_india || '',
    requireSponsorship: row.require_sponsorship || '',
    disability: row.disability || '',
    veteran: row.veteran || '',
    gender: row.gender || '',
    lgbtq: row.lgbtq || '',
    hispanicLatino: row.hispanic_latino || '',
    race: row.race || '',
    sexualOrientation: row.sexual_orientation || '',
    pronouns: row.pronouns || '',
    expectedSalary: row.expected_salary || '',
    availableStartDate: row.available_start_date || '',
    dateOfBirth: row.date_of_birth || '',
    additionalInfo: row.additional_info || '',
    achievements: row.achievements || ''
  };
  
  cloudProfile = {
    profile,
    resumeText: row.resume_text || '',
    fetchedAt: Date.now()
  };
}

async function getProfileData() {
  if (!cloudProfile) {
    try {
      await fetchProfile();
    } catch (e) {
      if (!cloudProfile) throw e; // fallback to stale if network error
    }
  }
  return cloudProfile;
}

async function startAutofill(tabId) {
  const frames = await chrome.webNavigation.getAllFrames({ tabId });
  for (const frame of frames) {
    chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_FIELDS' }, { frameId: frame.frameId }).catch(() => {});
  }
  return { ok: true };
}

async function parseJdTab(tabId) {
  const frames = await chrome.webNavigation.getAllFrames({ tabId });
  let fullText = '';
  for (const frame of frames) {
    try {
      const res = await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_TEXT' }, { frameId: frame.frameId });
      if (res && res.text) fullText += res.text + '\n';
    } catch (e) {}
  }
  
  if (!fullText.trim()) throw new Error('No text found on page');
  
  const prompt = `Summarize this job description. Extract the job title, company, key requirements, and responsibilities.
Return ONLY a plain text summary.

JD:
${fullText.substring(0, 15000)}`;
  const summary = await callLLM(prompt, false);
  await chrome.storage.local.set({ parsedJD: summary });
  return { summary };
}

async function handleMatchFields(fields) {
  const { profile, resumeText } = await getProfileData();
  const matched = {};
  const toLLM = [];
  
  for (const f of fields) {
    let ruleMatched = false;
    const textToMatch = `${f.label} ${f.name} ${f.placeholder}`.toLowerCase();
    for (const rule of RULES) {
      if (rule.regex.test(textToMatch)) {
        // Resolve dot notation for nested fields (e.g. education.0.schoolName)
        const keys = rule.field.split('.');
        let val = profile;
        for (const k of keys) {
          if (val !== undefined && val !== null) {
            val = val[k];
          } else {
            val = undefined;
            break;
          }
        }
        if (val) {
          matched[f.id] = val;
          ruleMatched = true;
          break;
        }
      }
    }
    if (!ruleMatched) {
      toLLM.push(f);
    }
  }
  
  if (toLLM.length > 0) {
    // Chunk to max 60 fields
    const chunks = [];
    for (let i = 0; i < toLLM.length; i += 60) {
      chunks.push(toLLM.slice(i, i + 60));
    }
    
    let lastError = null;
    for (const chunk of chunks) {
      const prompt = `You are an AI assistant helping to autofill a job application.
Map the following form fields to the correct values based on the user's profile and resume.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. The JSON keys MUST be the exact "id" of the fields provided.
3. The JSON values MUST be an object containing "label" (the field label) and "value" (the string value to fill).
4. If you do not know the answer or it is not in the profile/resume, DO NOT include that field's id in the JSON.
5. Do not guess. Do not shift values.
6. For EEO questions (race, gender, veteran, disability), answer "Prefer not to answer" unless explicitly stated.
7. NEVER put a URL (like a website or portfolio link) into a field unless the field explicitly asks for a URL, website, or link.
8. Pay strict attention to the field label. If it asks for a College/University, provide the name of the educational institution, NEVER a country, city, or date.
9. Prioritize the "label" over the "name" attribute when determining what a field is asking for.
10. If the field asks for "hometown", "city", "town", or "location", ONLY use the city or address from the profile.
11. If the field asks for "college", "university", "institute", or "school", ONLY use the collegeName from the education section.

Example Output:
{
  "field_abc123": {
    "label": "Full Name",
    "value": "John Doe"
  },
  "field_xyz789": {
    "label": "Email Address",
    "value": "john.doe@example.com"
  }
}

User Profile:
${JSON.stringify(profile, null, 2)}

Resume Text:
${resumeText.substring(0, 10000)}

Fields to fill:
${JSON.stringify(chunk.map(f => ({ id: f.id, label: f.label, name: f.name, placeholder: f.placeholder, type: f.type, options: f.options })), null, 2)}
`;
      
      try {
        const aiResult = await callLLM(prompt, true);
        const parsed = parseAnswerJson(aiResult);
        for (const [id, data] of Object.entries(parsed)) {
          if (data && data.value !== undefined) {
            matched[id] = data.value;
          } else if (typeof data === 'string') {
            matched[id] = data; // fallback just in case the LLM ignores instructions
          }
        }
      } catch (e) {
        console.error('LLM chunk failed', e);
        lastError = e;
      }
    }
    if (Object.keys(matched).length === 0 && lastError) {
      throw lastError;
    }
  }
  
  return { matched };
}

async function callLLM(prompt, jsonMode) {
  const data = await chrome.storage.local.get(['provider', 'geminiKey', 'groqKey', 'geminiModel', 'groqModel']);
  const provider = data.provider || 'gemini';
  
  if (provider === 'gemini') {
    if (!data.geminiKey) throw new Error('Gemini key not set');
    return await callGemini(prompt, data.geminiKey, data.geminiModel, jsonMode);
  } else {
    if (!data.groqKey) throw new Error('Groq key not set');
    return await callGroq(prompt, data.groqKey, data.groqModel, jsonMode);
  }
}

async function callGemini(prompt, key, model, jsonMode) {
  const actualModel = model || await resolveModel('gemini', key);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${key}`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 }
  };
  if (jsonMode) {
    body.generationConfig.responseMimeType = "application/json";
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${res.statusText} - ${errText}`);
  }
  const json = await res.json();
  return json.candidates[0].content.parts[0].text;
}

async function callGroq(prompt, key, model, jsonMode) {
  const actualModel = model || await resolveModel('groq', key);
  const url = `https://api.groq.com/openai/v1/chat/completions`;
  
  const body = {
    model: actualModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${res.status} ${res.statusText} - ${errText}`);
  }
  const json = await res.json();
  return json.choices[0].message.content;
}

async function resolveModel(provider, key) {
  const data = await chrome.storage.local.get([`${provider}Model`]);
  if (data[`${provider}Model`]) {
    return data[`${provider}Model`];
  }
  const models = PROVIDERS[provider].models;
  return models[0];
}

function parseAnswerJson(text) {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
    if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
    if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
  }
  return JSON.parse(clean.trim());
}

async function parseResumeToProfile(resumeText) {
  const prompt = `You are an AI assistant that extracts structured profile data from a resume.
Extract the following fields from the resume text and return ONLY a valid JSON object matching this exact structure.
If a field is not found or you are unsure, leave it as an empty string "" or an empty array [].

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. Do not include markdown formatting or extra text.

JSON Structure:
{
  "firstName": "", "middleName": "", "lastName": "", "email": "", "phone": "",
  "address": "", "city": "", "state": "", "country": "", "zip": "",
  "linkedin": "", "github": "", "website": "", "x": "", "medium": "", "leetcode": "", "gfg": "",
  "education": [
    {
      "collegeName": "", "branch": "", "degree": "", "gpa": "", "startDate": "", "endDate": "", "currentlyStudyHere": false
    }
  ],
  "workExperience": [
    {
      "company": "", "jobTitle": "", "location": "", "startDate": "", "endDate": "", "currentlyWorkHere": false, "summary": "", "bullets": [""]
    }
  ],
  "skills": [""],
  "languages": [""],
  "certificates": [""],
  "achievements": ""
}

Resume Text:
${resumeText.substring(0, 15000)}
`;

  const aiResult = await callLLM(prompt, true);
  return parseAnswerJson(aiResult);
}
