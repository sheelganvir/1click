<div align="center">
  <img src="assets/icon128.png" alt="1Click Logo" width="128" height="128" />
  <h1>1Click</h1>
  <p><strong>A free, AI-powered Chrome extension that autofills job applications instantly.</strong></p>
  <p>
    <a href="https://1clickjobs.live">Website</a> •
    <a href="#setup">Installation</a> •
    <a href="#architecture">How it Works</a>
  </p>
</div>

---

**1Click** is a privacy-first, AI-powered Chrome extension (Manifest V3) and Next.js web dashboard that helps you apply for jobs faster. It autofills complex job applications across major ATS platforms (Workday, Greenhouse, Lever, Ashby, and most generic forms).

## ✨ Features

- **Instant Autofill:** Standard fields (name, email, phone, links, address) are filled instantly via smart rules.
- **AI-Powered Parsing:** Complex or custom questions are answered intelligently using your resume and profile data.
- **Privacy First (Local AI Keys):** Your Gemini or Groq API keys live *only* in your browser's local storage. They are never sent to our servers.
- **Cloud Sync:** Update your profile or upload a new resume on the web dashboard, and it instantly syncs to the extension.
- **PDF Resume Parsing:** Upload your PDF resume to the dashboard, and 1Click will automatically extract your data, including hyperlinks.
- **Completely Free:** Use the public platform at [1clickjobs.live](https://1clickjobs.live).

## 🚀 How it Works

1Click consists of two main parts:
1. **The Web Dashboard ([1clickjobs.live](https://1clickjobs.live)):** Where you sign up, manage your profile, upload your resume, and configure your settings.
2. **The Chrome Extension:** The tool that lives in your browser, reads the job application page, and injects your data into the form fields.

```text
Web Dashboard ─ sign in, profile form, resume upload
        │
        ▼
Cloud Database ─ securely stores your profile and resume
        ▲
        │  read profile
Chrome Extension
   background worker ─ profile fetch, smart matching, AI calls
   options           ─ AI key (stored locally only)
```

---

## 💻 How to Use

Just follow these simple steps to get started:

1. **Install the Extension:** (Link to Chrome Web Store coming soon). For now, you can download this repository, go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the root folder.
2. **Sign Up:** Click the 1Click extension icon and click **Sign in / Sign up**. This will open the web dashboard ([1clickjobs.live](https://1clickjobs.live)).
3. **Build Your Profile:** Fill out your profile on the dashboard or upload a PDF resume to autofill it.
4. **Add Your AI Key:** Open the extension's **Options** (gear icon) and paste a free [Groq](https://console.groq.com/keys) or [Gemini](https://aistudio.google.com/app/apikey) API key. *Your key is stored locally in your browser and is never sent to our servers.*
5. **Apply:** Go to any job application page, click the extension icon, and hit **Autofill**!

*Note: Always review the filled answers before submitting your application. The extension will never auto-submit a form for you.*

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/Job-Autofill/issues).

<div align="center">
  <br />
  <i>Made by Sheel Ganvir</i>
</div>
