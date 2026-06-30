'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { emptyProfile, UserProfile } from '@/lib/profile'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// Reusable Input component
function Input({ label, value, onChange, type = "text", required = false, placeholder = "", prefix = "", numericOnly = false }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1">
        {required && <span className="text-red-500 mr-1">*</span>}{label}
      </label>
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">{prefix}</span>
          </div>
        )}
        <input
          type={type} 
          value={value} 
          onChange={e => {
            let val = e.target.value;
            if (numericOnly) {
              val = val.replace(/[^0-9./]/g, '');
            }
            onChange(val);
          }} 
          placeholder={placeholder}
          className={`w-full rounded-md border border-gray-300 bg-white py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${prefix ? 'pl-10 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  )
}

// Reusable Select component
function Select({ label, value, onChange, options, required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1">
        {required && <span className="text-red-500 mr-1">*</span>}{label}
      </label>
      <select
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      >
        <option value="">Select...</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export default function DashboardClient({ userId, email, initialProfile }: { userId: string, email: string, initialProfile: any }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const p = emptyProfile()
    // Map snake_case from DB to camelCase in frontend
    p.firstName = initialProfile.first_name || ''
    p.middleName = initialProfile.middle_name || ''
    p.lastName = initialProfile.last_name || ''
    p.preferredFirstName = initialProfile.preferred_first_name || ''
    p.preferredMiddleName = initialProfile.preferred_middle_name || ''
    p.preferredLastName = initialProfile.preferred_last_name || ''
    p.email = initialProfile.email || email
    p.phoneType = initialProfile.phone_type || ''
    p.countryCode = initialProfile.country_code || ''
    p.phone = initialProfile.phone || ''
    p.address = initialProfile.address || ''
    p.city = initialProfile.city || ''
    p.nationality = initialProfile.nationality || ''
    p.state = initialProfile.state || ''
    p.zip = initialProfile.zip || ''
    p.country = initialProfile.country || ''
    p.linkedin = initialProfile.linkedin || ''
    p.github = initialProfile.github || ''
    p.website = initialProfile.website || ''
    p.x = initialProfile.x || ''
    p.medium = initialProfile.medium || ''
    p.leetcode = initialProfile.leetcode || ''
    p.gfg = initialProfile.gfg || ''
    p.education = initialProfile.education || []
    p.workExperience = initialProfile.work_experience || []
    p.skills = initialProfile.skills || []
    p.languages = initialProfile.languages || []
    p.certificates = initialProfile.certificates || []
    p.workAuthIndia = initialProfile.work_auth_india || ''
    p.requireSponsorship = initialProfile.require_sponsorship || ''
    p.disability = initialProfile.disability || ''
    p.veteran = initialProfile.veteran || ''
    p.gender = initialProfile.gender || ''
    p.lgbtq = initialProfile.lgbtq || ''
    p.hispanicLatino = initialProfile.hispanic_latino || ''
    p.race = initialProfile.race || ''
    p.sexualOrientation = initialProfile.sexual_orientation || ''
    p.pronouns = initialProfile.pronouns || ''
    p.expectedSalary = initialProfile.expected_salary || ''
    p.availableStartDate = initialProfile.available_start_date || ''
    p.dateOfBirth = initialProfile.date_of_birth || ''
    p.additionalInfo = initialProfile.additional_info || ''
    p.achievements = initialProfile.achievements || ''
    return p
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState(initialProfile.resume_path ? initialProfile.resume_path.split('/').pop() : '')
  const [saving, setSaving] = useState(false)
  const [parsingResume, setParsingResume] = useState(false)
  const [msg, setMsg] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [langInput, setLangInput] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [groqKey, setGroqKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('groqKey') || '';
    }
    return '';
  })
  
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [settingsMsg, setSettingsMsg] = useState('')
  const [settingsLoading, setSettingsLoading] = useState(false)

  const handleUpdateCredentials = async () => {
    setSettingsLoading(true)
    setSettingsMsg('')
    const updates: any = {}
    if (newEmail.trim()) updates.email = newEmail.trim()
    if (newPassword.trim()) updates.password = newPassword.trim()
    
    if (Object.keys(updates).length === 0) {
      setSettingsMsg('Please enter a new email or password.')
      setSettingsLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser(updates)
    if (error) {
      setSettingsMsg('Error: ' + error.message)
    } else {
      setSettingsMsg('Successfully updated! (If email changed, check your inbox for confirmation)')
      setNewEmail('')
      setNewPassword('')
    }
    setSettingsLoading(false)
  }

  const handleFileUpload = async (e: any) => {
    if (!e.target.files || !e.target.files[0]) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setResumeName(uploadedFile.name);
    setParsingResume(true);
    setMsg('Extracting profile from resume...');

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
        
        // Extract hyperlinks from the PDF page
        try {
          const annotations = await page.getAnnotations();
          const links = annotations
            .filter((a: any) => a.subtype === 'Link' && a.url)
            .map((a: any) => a.url);
          if (links.length > 0) {
            text += '\n[Hyperlinks found on this page:]\n' + links.join('\n') + '\n';
          }
        } catch (err) {
          console.error('Could not extract links from page', err);
        }
      }

      // If user provided a Groq key on the dashboard, parse it directly here
      if (groqKey.trim()) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey.trim()}`
            },
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              messages: [{
                role: 'user',
                content: `You are an AI assistant that extracts structured profile data from a resume.
Extract the following fields from the resume text and return ONLY a valid JSON object matching this exact structure.
If a field is not found or you are unsure, leave it as an empty string "" or an empty array [].

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. Do not include markdown formatting or extra text.

JSON Structure:
{
  "firstName": "", "lastName": "", "email": "", "phone": "",
  "address": "", "city": "", "state": "", "country": "", "zip": "", "dateOfBirth": "",
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
${text.substring(0, 15000)}`
              }],
              temperature: 0.1,
              response_format: { type: "json_object" }
            })
          });

          if (!res.ok) throw new Error(`Groq API error: ${res.statusText}`);
          const json = await res.json();
          let parsedText = json.choices[0].message.content.trim();
          
          if (parsedText.startsWith('```json')) {
            parsedText = parsedText.substring(7);
            if (parsedText.endsWith('```')) parsedText = parsedText.substring(0, parsedText.length - 3);
          } else if (parsedText.startsWith('```')) {
            parsedText = parsedText.substring(3);
            if (parsedText.endsWith('```')) parsedText = parsedText.substring(0, parsedText.length - 3);
          }
          
          const p = JSON.parse(parsedText.trim());
            setProfile(prev => ({
              ...prev,
              firstName: p.firstName || prev.firstName,
              lastName: p.lastName || prev.lastName,
              email: p.email || prev.email,
              phone: p.phone || prev.phone,
              address: p.address || prev.address,
              city: p.city || prev.city,
              state: p.state || prev.state,
              country: p.country || prev.country,
              zip: p.zip || prev.zip,
              dateOfBirth: p.dateOfBirth || prev.dateOfBirth,
              linkedin: p.linkedin || prev.linkedin,
              github: p.github || prev.github,
              website: p.website || prev.website,
              x: p.x || prev.x,
              medium: p.medium || prev.medium,
              leetcode: p.leetcode || prev.leetcode,
              gfg: p.gfg || prev.gfg,
              education: p.education && p.education.length > 0 ? p.education : prev.education,
              workExperience: p.workExperience && p.workExperience.length > 0 ? p.workExperience : prev.workExperience,
              skills: p.skills && p.skills.length > 0 ? p.skills : prev.skills,
              languages: p.languages && p.languages.length > 0 ? p.languages : prev.languages,
              certificates: p.certificates && p.certificates.length > 0 ? p.certificates : prev.certificates,
              achievements: p.achievements || prev.achievements
            }));
          setMsg('Profile autofilled from resume!');
          setParsingResume(false);
          return;
        } catch (e: any) {
          setMsg('Error parsing with Groq: ' + e.message);
          setParsingResume(false);
          return;
        }
      }

      // Otherwise, try sending to extension for parsing
      
      const extId = process.env.NEXT_PUBLIC_EXTENSION_ID;
      if (extId && (window as any).chrome && (window as any).chrome.runtime) {
        (window as any).chrome.runtime.sendMessage(extId, { type: 'PARSE_RESUME_TO_PROFILE', text }, (response: any) => {
          if ((window as any).chrome.runtime.lastError) {
            setMsg('Resume uploaded. (Extension not connected, could not autofill)');
            setParsingResume(false);
            return;
          }
          if (response && response.ok && response.profile) {
            const p = response.profile;
            setProfile(prev => ({
              ...prev,
              firstName: p.firstName || prev.firstName,
              lastName: p.lastName || prev.lastName,
              email: p.email || prev.email,
              phone: p.phone || prev.phone,
              address: p.address || prev.address,
              city: p.city || prev.city,
              state: p.state || prev.state,
              country: p.country || prev.country,
              zip: p.zip || prev.zip,
              dateOfBirth: p.dateOfBirth || prev.dateOfBirth,
              linkedin: p.linkedin || prev.linkedin,
              github: p.github || prev.github,
              website: p.website || prev.website,
              x: p.x || prev.x,
              medium: p.medium || prev.medium,
              leetcode: p.leetcode || prev.leetcode,
              gfg: p.gfg || prev.gfg,
              education: p.education && p.education.length > 0 ? p.education : prev.education,
              workExperience: p.workExperience && p.workExperience.length > 0 ? p.workExperience : prev.workExperience,
              skills: p.skills && p.skills.length > 0 ? p.skills : prev.skills,
              languages: p.languages && p.languages.length > 0 ? p.languages : prev.languages,
              certificates: p.certificates && p.certificates.length > 0 ? p.certificates : prev.certificates,
              achievements: p.achievements || prev.achievements
            }));
            setMsg('Profile autofilled from resume!');
          } else {
            setMsg('Resume uploaded. ' + (response?.error ? `(Autofill error: ${response.error})` : ''));
          }
          setParsingResume(false);
        });
      } else {
        setMsg('Resume uploaded. (Extension not found, could not autofill)');
        setParsingResume(false);
      }
    } catch (err: any) {
      setMsg('Error parsing PDF: ' + err.message);
      setParsingResume(false);
    }
  };

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    
    let resumeText = initialProfile.resume_text || ''
    let resumePath = initialProfile.resume_path || ''

    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map((item: any) => item.str).join(' ') + '\n'
          
          try {
            const annotations = await page.getAnnotations();
            const links = annotations
              .filter((a: any) => a.subtype === 'Link' && a.url)
              .map((a: any) => a.url);
            if (links.length > 0) {
              text += '\n[Hyperlinks found on this page:]\n' + links.join('\n') + '\n';
            }
          } catch (err) {
            console.error('Could not extract links from page', err);
          }
        }
        resumeText = text

        const filePath = `${userId}/${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file, { upsert: true })
          
        if (uploadError) throw uploadError
        resumePath = filePath
      } catch (e: any) {
        setMsg('Error processing PDF: ' + e.message)
        setSaving(false)
        return
      }
    }

    const dbData = { 
      id: userId, email, resume_text: resumeText, resume_path: resumePath,
      first_name: profile.firstName, middle_name: profile.middleName, last_name: profile.lastName,
      preferred_first_name: profile.preferredFirstName, preferred_middle_name: profile.preferredMiddleName, preferred_last_name: profile.preferredLastName,
      phone_type: profile.phoneType, country_code: profile.countryCode, phone: profile.phone,
      address: profile.address, city: profile.city, nationality: profile.nationality, state: profile.state, zip: profile.zip, country: profile.country,
      linkedin: profile.linkedin, github: profile.github, website: profile.website,
      x: profile.x, medium: profile.medium, leetcode: profile.leetcode, gfg: profile.gfg,
      education: profile.education, work_experience: profile.workExperience, skills: profile.skills, languages: profile.languages, certificates: profile.certificates,
      work_auth_india: profile.workAuthIndia, require_sponsorship: profile.requireSponsorship, disability: profile.disability, veteran: profile.veteran,
      gender: profile.gender, lgbtq: profile.lgbtq, hispanic_latino: profile.hispanicLatino, race: profile.race, sexual_orientation: profile.sexualOrientation, pronouns: profile.pronouns,
      expected_salary: profile.expectedSalary, available_start_date: profile.availableStartDate, date_of_birth: profile.dateOfBirth, additional_info: profile.additionalInfo, achievements: profile.achievements
    }

    const { error } = await supabase.from('profiles').upsert(dbData)
    
    if (error) {
      setMsg('Error saving profile: ' + error.message)
    } else {
      setMsg('Profile saved successfully!')
      router.refresh()
    }
    
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="bg-white shadow rounded-xl p-8 space-y-10">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>
        <div className="space-x-4">
          <button onClick={() => setIsSettingsOpen(true)} className="text-gray-600 hover:text-gray-900 text-sm font-medium cursor-pointer">Settings</button>
          <a href="/connect" className="text-indigo-600 hover:underline text-sm font-medium cursor-pointer">Connect Extension</a>
          <button onClick={handleSignOut} className="text-red-600 hover:underline text-sm font-medium cursor-pointer">Sign Out</button>
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Resume & Autofill</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Groq API Key (Optional, for web-based parsing)
            </label>
            <p className="text-xs text-gray-500 mb-2">If your extension is not connected, enter your Groq API key here to autofill your profile from your resume.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 md:w-1/2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button 
                onClick={() => {
                  if (groqKey.trim()) {
                    localStorage.setItem('groqKey', groqKey.trim());
                    setMsg('Groq API Key saved locally!');
                  } else {
                    localStorage.removeItem('groqKey');
                    setMsg('Groq API Key removed!');
                  }
                  setTimeout(() => setMsg(''), 3000);
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 font-bold text-sm cursor-pointer"
              >
                Save Key
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <input 
              type="file" accept="application/pdf"
              onChange={handleFileUpload}
              disabled={parsingResume || saving}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 disabled:opacity-50 file:cursor-pointer"
            />
            {parsingResume && <span className="text-sm text-indigo-600 whitespace-nowrap font-bold animate-pulse">Extracting profile...</span>}
            {!parsingResume && resumeName && <span className="text-sm text-gray-600 whitespace-nowrap font-medium">Current: {resumeName}</span>}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label="First Name" required value={profile.firstName} onChange={(v: string) => setProfile({...profile, firstName: v})} placeholder="e.g. John" />
          <Input label="Middle Name" value={profile.middleName} onChange={(v: string) => setProfile({...profile, middleName: v})} placeholder="e.g. Robert" />
          <Input label="Last Name" required value={profile.lastName} onChange={(v: string) => setProfile({...profile, lastName: v})} placeholder="e.g. Doe" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label="Preferred First Name" value={profile.preferredFirstName} onChange={(v: string) => setProfile({...profile, preferredFirstName: v})} placeholder="e.g. Johnny" />
          <Input label="Preferred Middle Name" value={profile.preferredMiddleName} onChange={(v: string) => setProfile({...profile, preferredMiddleName: v})} placeholder="e.g. Rob" />
          <Input label="Preferred Last Name" value={profile.preferredLastName} onChange={(v: string) => setProfile({...profile, preferredLastName: v})} placeholder="e.g. Doe" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Date of Birth" type="date" value={profile.dateOfBirth} onChange={(v: string) => setProfile({...profile, dateOfBirth: v})} />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Email Address" required type="email" value={profile.email} onChange={(v: string) => setProfile({...profile, email: v})} placeholder="john.doe@example.com" />
          <Select label="Phone Type" value={profile.phoneType} onChange={(v: string) => setProfile({...profile, phoneType: v})} options={['Mobile', 'Home', 'Work']} />
          <div className="flex gap-2">
            <div className="w-1/3">
              <Select 
                label="Code" 
                value={profile.countryCode} 
                onChange={(v: string) => setProfile({...profile, countryCode: v})} 
                options={['+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+234', '+254', '+351', '+353', '+358', '+380', '+420', '+880', '+966', '+971', '+972']} 
              />
            </div>
            <div className="w-2/3"><Input label="Phone" required value={profile.phone} onChange={(v: string) => setProfile({...profile, phone: v})} placeholder="1234567890" numericOnly /></div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Address</h2>
        <div className="mb-4">
          <Input label="Address Line" value={profile.address} onChange={(v: string) => setProfile({...profile, address: v})} placeholder="123 Main St, Apt 4B" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select label="Country" value={profile.country} onChange={(v: string) => setProfile({...profile, country: v})} options={COUNTRIES} />
          <Input label="State/Province" value={profile.state} onChange={(v: string) => setProfile({...profile, state: v})} placeholder="e.g. Maharashtra, CA" />
          <Input label="City" required value={profile.city} onChange={(v: string) => setProfile({...profile, city: v})} placeholder="e.g. Mumbai, San Francisco" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Nationality/Citizenship" value={profile.nationality} onChange={(v: string) => setProfile({...profile, nationality: v})} options={COUNTRIES} />
          <Input label="Postal Code" value={profile.zip} onChange={(v: string) => setProfile({...profile, zip: v})} placeholder="e.g. 400001, 94105" numericOnly />
        </div>
      </div>

      {/* Links */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="LinkedIn URL" value={profile.linkedin} onChange={(v: string) => setProfile({...profile, linkedin: v})} placeholder="https://linkedin.com/in/johndoe" />
          <Input label="GitHub URL" value={profile.github} onChange={(v: string) => setProfile({...profile, github: v})} placeholder="https://github.com/johndoe" />
          <Input label="Website/Portfolio URL" value={profile.website} onChange={(v: string) => setProfile({...profile, website: v})} placeholder="https://johndoe.com" />
          <Input label="X (Twitter) URL" value={profile.x} onChange={(v: string) => setProfile({...profile, x: v})} placeholder="https://x.com/johndoe" />
          <Input label="Medium URL" value={profile.medium} onChange={(v: string) => setProfile({...profile, medium: v})} placeholder="https://medium.com/@johndoe" />
          <Input label="LeetCode URL" value={profile.leetcode} onChange={(v: string) => setProfile({...profile, leetcode: v})} placeholder="https://leetcode.com/u/johndoe" />
          <Input label="GeeksforGeeks URL" value={profile.gfg} onChange={(v: string) => setProfile({...profile, gfg: v})} placeholder="https://auth.geeksforgeeks.org/user/johndoe" />
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Education</h2>
        {profile.education.map((edu, i) => (
          <div key={i} className="mb-6 p-4 border rounded-lg bg-gray-50 relative">
            <button onClick={() => setProfile({...profile, education: profile.education.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold cursor-pointer">Remove</button>
            <h3 className="font-bold mb-4 text-gray-900">Education {i + 1}</h3>
            <div className="mb-4"><Input label="College Name" required value={edu.collegeName} onChange={(v: string) => { const e = [...profile.education]; e[i].collegeName = v; setProfile({...profile, education: e}) }} placeholder="e.g. Stanford University, IIT Bombay" /></div>
            <div className="mb-4"><Input label="Branch/Specialization" value={edu.branch || ''} onChange={(v: string) => { const e = [...profile.education]; e[i].branch = v; setProfile({...profile, education: e}) }} placeholder="e.g. Computer Science, Mechanical Engineering" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Accreditation (Degree)" required value={edu.degree} onChange={(v: string) => { const e = [...profile.education]; e[i].degree = v; setProfile({...profile, education: e}) }} placeholder="e.g. B.S. Computer Science, B.Tech" />
              <Input label="GPA" value={edu.gpa} onChange={(v: string) => { const e = [...profile.education]; e[i].gpa = v; setProfile({...profile, education: e}) }} placeholder="e.g. 3.8/4.0, 8.5/10" numericOnly />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Start Date" value={edu.startDate} onChange={(v: string) => { const e = [...profile.education]; e[i].startDate = v; setProfile({...profile, education: e}) }} placeholder="e.g. Aug 2018, 08/2018" />
              <div>
                <Input label="End Date" value={edu.endDate} onChange={(v: string) => { const e = [...profile.education]; e[i].endDate = v; setProfile({...profile, education: e}) }} placeholder="e.g. May 2022, Present" />
                <label className="flex items-center mt-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={edu.currentlyStudyHere} onChange={(e) => { const ed = [...profile.education]; ed[i].currentlyStudyHere = e.target.checked; setProfile({...profile, education: ed}) }} className="mr-2 rounded" />
                  I currently study here
                </label>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setProfile({...profile, education: [...profile.education, { collegeName: '', branch: '', degree: '', gpa: '', startDate: '', endDate: '', currentlyStudyHere: false }]})} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">+ Add Education</button>
      </div>

      {/* Work Experience */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Work Experience</h2>
        {profile.workExperience.map((work, i) => (
          <div key={i} className="mb-6 p-4 border rounded-lg bg-gray-50 relative">
            <button onClick={() => setProfile({...profile, workExperience: profile.workExperience.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold cursor-pointer">Remove</button>
            <h3 className="font-bold mb-4 text-gray-900">Work Experience {i + 1}</h3>
            <div className="mb-4"><Input label="Company" required value={work.company} onChange={(v: string) => { const w = [...profile.workExperience]; w[i].company = v; setProfile({...profile, workExperience: w}) }} placeholder="e.g. Google, TCS" /></div>
            <div className="mb-4"><Input label="Job Title" required value={work.jobTitle} onChange={(v: string) => { const w = [...profile.workExperience]; w[i].jobTitle = v; setProfile({...profile, workExperience: w}) }} placeholder="e.g. Software Engineer" /></div>
            <div className="mb-4"><Input label="Location" value={work.location} onChange={(v: string) => { const w = [...profile.workExperience]; w[i].location = v; setProfile({...profile, workExperience: w}) }} placeholder="e.g. Remote, Bangalore" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Start Date" value={work.startDate} onChange={(v: string) => { const w = [...profile.workExperience]; w[i].startDate = v; setProfile({...profile, workExperience: w}) }} placeholder="e.g. Jun 2022" />
              <div>
                <Input label="End Date" value={work.endDate} onChange={(v: string) => { const w = [...profile.workExperience]; w[i].endDate = v; setProfile({...profile, workExperience: w}) }} placeholder="e.g. Present" />
                <label className="flex items-center mt-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={work.currentlyWorkHere} onChange={(e) => { const w = [...profile.workExperience]; w[i].currentlyWorkHere = e.target.checked; setProfile({...profile, workExperience: w}) }} className="mr-2 rounded" />
                  I currently work here
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">Experience Summary</label>
              <textarea value={work.summary} onChange={(e) => { const w = [...profile.workExperience]; w[i].summary = e.target.value; setProfile({...profile, workExperience: w}) }} placeholder="Brief overview of your role..." className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Job Description (Bullets)</label>
              {work.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex gap-2 mb-2">
                  <input type="text" value={bullet} onChange={(e) => { const w = [...profile.workExperience]; w[i].bullets[bIdx] = e.target.value; setProfile({...profile, workExperience: w}) }} placeholder="e.g. Developed scalable microservices using Node.js..." className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  <button onClick={() => { const w = [...profile.workExperience]; w[i].bullets = w[i].bullets.filter((_, idx) => idx !== bIdx); setProfile({...profile, workExperience: w}) }} className="px-3 text-gray-400 hover:text-red-500 cursor-pointer">✕</button>
                </div>
              ))}
              <button onClick={() => { const w = [...profile.workExperience]; w[i].bullets.push(''); setProfile({...profile, workExperience: w}) }} className="px-4 py-2 mt-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">+ Add Bullet Point</button>
            </div>
          </div>
        ))}
        <button onClick={() => setProfile({...profile, workExperience: [...profile.workExperience, { company: '', jobTitle: '', location: '', startDate: '', endDate: '', currentlyWorkHere: false, summary: '', bullets: [] }]})} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">+ Add Work Experience</button>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.map((skill, i) => (
            <span key={i} className="bg-gray-100 border border-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {skill}
              <button onClick={() => setProfile({...profile, skills: profile.skills.filter((_, idx) => idx !== i)})} className="text-gray-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </span>
          ))}
          <input 
            type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill and press Enter..."
            onKeyDown={e => {
              if (e.key === 'Enter' && skillInput.trim()) {
                e.preventDefault();
                if (!profile.skills.includes(skillInput.trim())) {
                  setProfile({...profile, skills: [...profile.skills, skillInput.trim()]});
                }
                setSkillInput('');
              }
            }}
            className="border border-gray-300 bg-white px-4 py-1 rounded-full text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
          />
        </div>
      </div>

      {/* Languages */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Languages (Max 3)</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.languages.map((lang, i) => (
            <span key={i} className="bg-indigo-100 border border-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {lang}
              <button onClick={() => setProfile({...profile, languages: profile.languages.filter((_, idx) => idx !== i)})} className="text-indigo-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </span>
          ))}
          {profile.languages.length < 3 && (
            <div className="relative">
              <input 
                list="language-options"
                type="text" value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="Add a language..."
                onKeyDown={e => {
                  if (e.key === 'Enter' && langInput.trim()) {
                    e.preventDefault();
                    if (!profile.languages.includes(langInput.trim())) {
                      setProfile({...profile, languages: [...profile.languages, langInput.trim()]});
                    }
                    setLangInput('');
                  }
                }}
                className="border border-gray-300 bg-white px-4 py-1 rounded-full text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48"
              />
              <datalist id="language-options">
                <option value="English" />
                <option value="Hindi" />
                <option value="Japanese" />
                <option value="Spanish" />
                <option value="French" />
                <option value="German" />
                <option value="Mandarin" />
                <option value="Arabic" />
                <option value="Russian" />
                <option value="Portuguese" />
              </datalist>
            </div>
          )}
        </div>
      </div>

      {/* Certificates */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Certificates (Max 3)</h2>
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <Input 
              key={i} 
              label={`Certificate Link ${i + 1}`} 
              value={profile.certificates[i] || ''} 
              onChange={(v: string) => {
                const newCerts = [...profile.certificates];
                newCerts[i] = v;
                setProfile({...profile, certificates: newCerts});
              }} 
              placeholder="https://..." 
            />
          ))}
        </div>
      </div>

      {/* EEO & Diversity */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">EEO & Diversity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select label="Are you authorized to work in the India?" value={profile.workAuthIndia} onChange={(v: string) => setProfile({...profile, workAuthIndia: v})} options={['Yes', 'No']} />
          <Select label="Will you require sponsorship?" value={profile.requireSponsorship} onChange={(v: string) => setProfile({...profile, requireSponsorship: v})} options={['Yes', 'No']} />
          <Select label="Do you have a disability?" value={profile.disability} onChange={(v: string) => setProfile({...profile, disability: v})} options={['Yes', 'No', 'Decline to state']} />
          <Select label="Are you a veteran?" value={profile.veteran} onChange={(v: string) => setProfile({...profile, veteran: v})} options={['Yes', 'No', 'Decline to state']} />
          <Select label="What is your gender?" value={profile.gender} onChange={(v: string) => setProfile({...profile, gender: v})} options={['Female', 'Male', 'Non-binary', 'Decline to state']} />
          <Select label="Do you identify as LGBTQ+?" value={profile.lgbtq} onChange={(v: string) => setProfile({...profile, lgbtq: v})} options={['Yes', 'No', 'Decline to state']} />
          <Select label="Are you Hispanic/Latino?" value={profile.hispanicLatino} onChange={(v: string) => setProfile({...profile, hispanicLatino: v})} options={['Yes', 'No', 'Decline to state']} />
          <Select label="How would you identify your race?" value={profile.race} onChange={(v: string) => setProfile({...profile, race: v})} options={['Asian', 'Black or African American', 'White', 'Native American', 'Two or More Races', 'Decline to state']} />
          <Select label="Sexual Orientation" value={profile.sexualOrientation} onChange={(v: string) => setProfile({...profile, sexualOrientation: v})} options={['Heterosexual', 'Homosexual', 'Bisexual', 'Decline to state']} />
          <Select label="Pronouns" value={profile.pronouns} onChange={(v: string) => setProfile({...profile, pronouns: v})} options={['He/Him', 'She/Her', 'They/Them', 'Other']} />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Achievements</h2>
        <div>
          <textarea value={profile.achievements} onChange={(e) => setProfile({...profile, achievements: e.target.value})} placeholder="List your key achievements, awards, or publications..." className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={4}></textarea>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Expected Annual Salary" value={profile.expectedSalary} onChange={(v: string) => setProfile({...profile, expectedSalary: v})} prefix="₹" placeholder="in LPA" numericOnly />
          <Input label="When can you start your next job?" value={profile.availableStartDate} onChange={(v: string) => setProfile({...profile, availableStartDate: v})} placeholder="e.g. Immediately, 2 weeks notice" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Anything else we should know?</label>
          <textarea value={profile.additionalInfo} onChange={(e) => setProfile({...profile, additionalInfo: e.target.value})} placeholder="For example: work authorization, availability, relocation preferences..." className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={4}></textarea>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t flex items-center justify-between sticky bottom-0 bg-white py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-bold text-lg shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {msg && <span className={`text-sm font-bold ${msg.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
        </div>
        <div className="text-sm text-gray-400 font-medium italic">
          Made by Sheel Ganvir
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Profile Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-2">Update Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="New email address"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">Update Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <button 
              onClick={handleUpdateCredentials}
              disabled={settingsLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-bold text-sm w-full disabled:opacity-50 mb-4 cursor-pointer disabled:cursor-not-allowed"
            >
              {settingsLoading ? 'Updating...' : 'Update Credentials'}
            </button>
            
            {settingsMsg && (
              <p className={`text-sm font-bold mb-4 ${settingsMsg.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {settingsMsg}
              </p>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button onClick={() => { setIsSettingsOpen(false); setSettingsMsg(''); }} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-bold cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
