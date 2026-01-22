/* global lucide */
const APP_NAME = "TamuGO";
const TAMU_BLUE = "bg-[#007bff]";
const TEXT_BLUE = "text-[#007bff]";

const API_KEY = (window.TAMUGO_CONFIG && window.TAMUGO_CONFIG.API_KEY) || "";

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    nav: { home: "Home", studio: "AI Studio", profile: "Profile" },
    home: {
      hero: "Promoting is\nnot that\nhard\nanymore",
      services: "Services",
      createBanner: "Create Content\nUsing AI Studio",
      service1: "Create a new promotional video/photo with AI",
      service2: "Performance Dashboard"
    },
    studio: {
      title: "Tamu AI Studio",
      header: "What are we selling today?",
      upload: "Select video/photos of your product to upload",
      supported: "Supported format: .mp4, .mov, .jpg, .jpeg, .png, .heic",
      selectFile: "Select File",
      category: "Category",
      productName: "Product Name",
      vibe: "Vibe",
      format: "Format",
      genLanguage: "Language",
      generate: "Generate",
      generating: "Generating...",
      regenerate: "Regenerate Media & Caption",
      resultTitle: "Generated Result",
      suggested: "Suggested caption",
      strategy: "Marketing Strategy",
      shareBtn: "Share",
      shareTitle: "Which social media",
      shareSubtitle: "platform you want to post?",
      error: "Please fill in all fields",
      enhance: "Enhance",
      listen: "Listen",
      pause: "Pause",
      loadingAudio: "Loading Audio...",
      download: "Download"
    },
    profile: {
      header: "Profile",
      about: "About Shop",
      email: "E-mail Address",
      phone: "Phone Number",
      general: "General Settings",
      social: "Social Media Accounts",
      dashboard: "Performance Dashboard",
      language: "Language",
      logout: "Log Out",
      linkSocial: "Link to Social Media Accounts",
      link: "LINK",
      linked: "LINKED",
      langTitle: "Language"
    }
  },
  ms: {
    nav: { home: "Utama", studio: "Studio AI", profile: "Profil" },
    home: {
      hero: "Promosi kini\ntidak lagi\nsukar",
      services: "Perkhidmatan",
      createBanner: "Cipta Kandungan\nGuna Studio AI",
      service1: "Cipta video/foto promosi baru dengan AI",
      service2: "Papan Pemuka Prestasi"
    },
    studio: {
      title: "Studio AI Tamu",
      header: "Apa yang kita jual hari ini?",
      upload: "Pilih video/foto produk untuk dimuat naik",
      supported: "Format disokong: .mp4, .mov, .jpg, .jpeg, .png, .heic",
      selectFile: "Pilih Fail",
      category: "Kategori",
      productName: "Nama Produk",
      vibe: "Gaya",
      format: "Format",
      genLanguage: "Bahasa",
      generate: "Hasilkan",
      generating: "Sedang Menghasilkan...",
      regenerate: "Jana Semula Media & Kapsyen",
      resultTitle: "Hasil Dijana",
      suggested: "Cadangan Kapsyen",
      strategy: "Strategi Pemasaran",
      shareBtn: "Kongsi",
      shareTitle: "Media sosial mana",
      shareSubtitle: "yang anda ingin hantar?",
      error: "Sila isi semua ruangan",
      enhance: "Penambah",
      listen: "Dengar",
      pause: "Jeda",
      loadingAudio: "Memuatkan Audio...",
      download: "Muat Turun"
    },
    profile: {
      header: "Profil",
      about: "Tentang Kedai",
      email: "Alamat E-mel",
      phone: "Nombor Telefon",
      general: "Tetapan Umum",
      social: "Akaun Media Sosial",
      dashboard: "Papan Pemuka Prestasi",
      language: "Bahasa",
      logout: "Log Keluar",
      linkSocial: "Pautkan Akaun Media Sosial",
      link: "PAUT",
      linked: "TERPAUT",
      langTitle: "Bahasa"
    }
  }
};

// --- MOCK DATA ---
const CATEGORIES = ["Food & Beverage", "Handicrafts", "Tourism", "Fashion", "Health & Beauty"];
const VIBES = ["Funny", "Traditional", "Storyteller"];
const FORMATS = ["Promotion Video", "Poster/Flyer"];
const GEN_LANGUAGES = ["Malay", "English", "Mandarin"];

const DASHBOARD_STATS = [
  { label: "Total Reach", value: "12.5K" },
  { label: "Likes", value: "3,420" },
  { label: "Shares", value: "892" },
  { label: "Comments", value: "156" }
];

const SOCIAL_ACCOUNTS = [
  { id: "fb", name: "Facebook", linked: true },
  { id: "insta", name: "Instagram", linked: true },
  { id: "tiktok", name: "TikTok", linked: true },
  { id: "yt", name: "YouTube", linked: false }
];

// --- HELPERS ---
const $ = (sel) => document.querySelector(sel);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}

function pcmToWav(pcmData, sampleRate) {
  const binaryString = atob(pcmData);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + len, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, len, true);

  return new Blob([wavHeader, bytes], { type: "audio/wav" });
}

// --- GEMINI SERVICES ---
async function generateContent(productName, category, vibe, format, language, imageBase64, mimeType) {
  if (!API_KEY) return "Missing API key. Add it in config.js";

  const promptText = `
You are an AI content creator for TamuGO.
Task: Create a social media caption for a ${format}.
Category: ${category}
Product: "${productName}"
Vibe: ${vibe}
Language: ${language}
${imageBase64 ? "Context: I have attached an image. Describe its visual features appealingly." : ""}
Requirements: Focus on the unique cultural appeal of Sabah/Borneo within the ${category} sector. Include 3-5 hashtags. Return ONLY caption text.
  `.trim();

  const parts = [{ text: promptText }];
  if (imageBase64 && mimeType && mimeType.startsWith("image/")) {
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    }
  );

  if (!res.ok) return "Error generating content. Please check connection / API key.";
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No caption returned.";
}

async function generateStrategy(productName, category, vibe, language) {
  if (!API_KEY) return "Missing API key. Add it in config.js";
  const prompt = `Provide 3 short, actionable marketing tips (bullet points) for promoting a ${category} product named "${productName}" with a ${vibe} vibe in ${language} language. Keep it brief.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );

  if (!res.ok) return "Could not generate strategy.";
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No strategy returned.";
}

async function generateImage(productName, category, vibe, format, language) {
  if (!API_KEY) return null;

  const isPoster = format === "Poster/Flyer";
  let langContext = "";
  if (language === "Malay") {
    langContext = "Aesthetics: Malaysian Borneo cultural style. If any text is visible, it MUST be in Bahasa Melayu.";
  } else if (language === "Mandarin") {
    langContext = "Aesthetics: Appealing to Chinese audience. If any text is visible, it MUST be in Chinese characters.";
  } else {
    langContext = "Aesthetics: International/Global appeal. Any text must be in English.";
  }

  const prompt = isPoster
    ? `A vertical promotional poster design for ${productName} (${category}). Vibe: ${vibe}. ${langContext} High quality, professional graphic design, vibrant colors.`
    : `A cinematic 16:9 opening frame for a marketing video about ${productName} (${category}). Vibe: ${vibe}. ${langContext} Photorealistic, 4k, highly detailed, dramatic lighting.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  return b64 ? `data:image/png;base64,${b64}` : null;
}

async function generateSpeech(text) {
  if (!API_KEY) return null;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
        }
      })
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) return null;

  const blob = pcmToWav(audioData, 24000);
  return URL.createObjectURL(blob);
}

// --- APP STATE ---
const state = {
  view: "home", // home | studio | profile | profile-dashboard
  lang: "en",

  // studio state
  category: "",
  productName: "",
  vibe: "",
  format: "",
  genLanguage: "",
  selectedFile: null,
  previewUrl: null,
  isVideo: false,

  isLoading: false,
  hasGenerated: false,
  caption: "",
  strategy: "",
  generatedImage: null,

  audioUrl: null,
  isLoadingAudio: false,
  isSpeaking: false,
  audio: new Audio()
};

state.audio.addEventListener("ended", () => (state.isSpeaking = false));

// --- RENDER ---
function render() {
  const t = TRANSLATIONS[state.lang];
  const app = $("#app");

  app.innerHTML = `
    <div class="flex flex-col h-[100dvh] bg-white font-sans text-gray-900 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <main class="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
        ${state.view === "home" ? HomeView(t) : ""}
        ${state.view === "studio" ? StudioView(t) : ""}
        ${state.view === "profile" || state.view === "profile-dashboard" ? ProfileView(t) : ""}
      </main>

      ${NavBar(t)}

      <style>
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      </style>
    </div>
  `;

  // Recreate lucide icons
  if (window.lucide) lucide.createIcons();

  bindEvents();
}

function NavBar(t) {
  const isProfileActive = state.view === "profile" || state.view === "profile-dashboard";
  return `
    <nav class="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-lg">
      <div class="grid grid-cols-3 h-16">
        ${NavBtn("home", "home", t.nav.home, state.view === "home")}
        ${NavBtn("studio", "video", t.nav.studio, state.view === "studio")}
        ${NavBtn("profile", "user", t.nav.profile, isProfileActive)}
      </div>
    </nav>
  `;
}

function NavBtn(view, icon, label, active) {
  return `
    <button data-nav="${view}" class="flex flex-col items-center justify-center space-y-1 ${active ? TEXT_BLUE : "text-gray-400"}">
      <i data-lucide="${icon}"></i>
      <span class="text-[10px] font-bold">${label}</span>
    </button>
  `;
}

function HomeView(t) {
  return `
    <div class="p-5 pb-24 space-y-8">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-gradient-to-tr from-[#007bff] to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
            <i data-lucide="rocket" class="w-5 h-5"></i>
          </div>
          <h1 class="text-2xl font-bold ${TEXT_BLUE}">${APP_NAME}</h1>
        </div>
        <span class="text-xs text-gray-400">07:00</span>
      </div>

      <div class="relative h-48 rounded-2xl overflow-hidden shadow-md group">
        <img
          src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000&auto=format&fit=crop"
          alt="Cultural Hero"
          class="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
        />
        <div class="absolute inset-0 p-6 flex flex-col justify-center">
          <h2 class="text-3xl font-bold text-white leading-tight whitespace-pre-wrap drop-shadow-md">${t.home.hero}</h2>
        </div>
      </div>

      <div data-go="studio"
        class="bg-gradient-to-r from-blue-100 to-cyan-50 rounded-2xl p-6 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
        <div>
          <h3 class="font-bold text-lg text-gray-800 whitespace-pre-wrap leading-tight">${t.home.createBanner}</h3>
        </div>
        <div class="relative">
          <div class="w-16 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center -rotate-6 z-10 relative">
            <i data-lucide="image" class="w-6 h-6 text-blue-500"></i>
          </div>
          <i data-lucide="sparkles" class="w-6 h-6 text-yellow-400 absolute -bottom-2 -left-4"></i>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-4">${t.home.services}</h3>

        <div class="grid grid-cols-2 gap-4 h-48">
          <div data-go="studio" class="flex flex-col gap-2 cursor-pointer group h-full">
            <div class="rounded-3xl overflow-hidden shadow-md relative h-full">
              <div class="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                  <i data-lucide="video" class="w-8 h-8 text-white"></i>
                </div>
              </div>
            </div>
            <p class="text-xs font-bold text-gray-600 text-center leading-relaxed px-1">${t.home.service1}</p>
          </div>

          <div data-go="profile-dashboard" class="flex flex-col gap-2 cursor-pointer group h-full">
            <div class="bg-white border border-gray-100 rounded-3xl p-3 shadow-md h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-gray-800">Performance</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>
              </div>
              <div class="grid grid-cols-2 gap-2 flex-1">
                ${DASHBOARD_STATS.map(s => `
                  <div class="bg-gray-100 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                    <span class="text-[10px] font-bold text-gray-700 leading-none">${s.value}</span>
                    <span class="text-[10px] text-gray-500">${s.label}</span>
                  </div>
                `).join("")}
              </div>
            </div>
            <p class="text-xs font-bold text-gray-600 text-center leading-relaxed px-1">${t.home.service2}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function chipButtons(options, selected, name) {
  return `
    <div class="flex flex-wrap gap-3">
      ${options.map(opt => `
        <button data-chip="${name}" data-value="${opt}"
          class="px-6 py-2 rounded-full text-sm font-medium transition-all border ${
            selected === opt ? "bg-white border-blue-500 text-blue-500 shadow-sm" : "bg-white border-gray-200 text-gray-500"
          }">
          ${opt}
        </button>
      `).join("")}
    </div>
  `;
}

function StudioView(t) {
  const preview = state.previewUrl
    ? (state.isVideo
        ? `<video src="${state.previewUrl}" class="w-full h-full object-cover" controls></video>`
        : `<img src="${state.previewUrl}" class="w-full h-full object-cover" alt="Preview" />`)
    : `
      <div class="w-16 h-16 ${TAMU_BLUE} rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
        <i data-lucide="upload-cloud" class="w-7 h-7"></i>
      </div>
      <p class="font-bold text-gray-800 mb-1">${t.studio.upload}</p>
      <p class="text-[10px] text-gray-500">${t.studio.supported}</p>
      <div class="mt-4 px-6 py-2 ${TAMU_BLUE} text-white text-sm font-bold rounded-full">${t.studio.selectFile}</div>
    `;

  const resultBlock = state.hasGenerated ? `
    <div class="space-y-6 mt-6">
      <div class="bg-black rounded-xl aspect-video relative overflow-hidden flex items-center justify-center border-2 border-purple-400 shadow-2xl">
        ${state.isVideo && state.previewUrl
          ? `<video src="${state.previewUrl}" class="w-full h-full object-cover" controls></video>`
          : (state.generatedImage
              ? `<img src="${state.generatedImage}" class="w-full h-full object-cover" alt="Generated" />`
              : `<div class="text-white text-sm">No generated visual</div>`)}
        <button data-action="download"
          class="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          title="${t.studio.download}">
          <i data-lucide="download" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <div class="flex items-center gap-2 mb-2 text-yellow-800 font-bold">
          <i data-lucide="lightbulb" class="w-4 h-4"></i>
          <h3>${t.studio.strategy}</h3>
        </div>
        <div class="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">${escapeHtml(state.strategy)}</div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-end">
          <h3 class="font-bold text-gray-800 text-sm">${t.studio.suggested}</h3>
          <button data-action="tts"
            class="flex items-center gap-1 text-xs text-[#007bff] font-bold bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100">
            <i data-lucide="${state.isSpeaking ? "pause" : "volume-2"}" class="w-3 h-3"></i>
            <span>${state.isSpeaking ? t.studio.pause : t.studio.listen}</span>
          </button>
        </div>
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
          <textarea id="captionBox"
            class="w-full bg-transparent text-sm text-gray-600 h-40 resize-none focus:outline-none pr-8"
          >${escapeHtml(state.caption)}</textarea>
          <button data-action="copy"
            class="absolute bottom-4 right-4 p-1 text-blue-500 hover:bg-blue-50 rounded">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <div class="flex gap-3 mb-8">
        <button data-action="download"
          class="flex-1 py-4 bg-gray-100 text-gray-800 font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-200">
          <i data-lucide="download" class="w-5 h-5"></i>
          ${t.studio.download}
        </button>
        <button data-action="share"
          class="flex-[2] py-4 ${TAMU_BLUE} text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2">
          <i data-lucide="share-2" class="w-5 h-5"></i>
          ${t.studio.shareBtn}
        </button>
      </div>
    </div>
  ` : "";

  return `
    <div class="p-5 pb-24 h-full flex flex-col">
      <div class="flex items-center justify-center relative mb-6">
        <h2 class="text-lg font-bold text-white bg-[#007bff] w-[120%] -ml-[10%] text-center py-4 shadow-sm sticky top-0 z-40">${t.studio.title}</h2>
      </div>

      <div class="flex-1 overflow-y-auto no-scrollbar space-y-6 pt-2">
        ${!state.hasGenerated ? `<h1 class="text-2xl font-bold text-gray-900">${t.studio.header}</h1>` : ""}

        <input id="fileInput" type="file" accept="image/*,video/*" class="hidden" />

        <div id="uploadBox"
          class="border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all relative overflow-hidden ${
            state.previewUrl ? "border-[#007bff] bg-gray-50 h-64 p-0" : "border-blue-200 bg-blue-50/50 hover:bg-blue-50 p-8"
          }">
          ${preview}
          ${state.previewUrl ? `
            <button data-action="clearFile"
              class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 z-10">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          ` : ""}
        </div>

        <div class="space-y-2">
          <label class="font-bold text-gray-800">${t.studio.category}</label>
          ${chipButtons(CATEGORIES, state.category, "category")}
        </div>

        <div class="space-y-2">
          <label class="font-bold text-gray-800">${t.studio.productName}</label>
          <input id="productName"
            class="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            value="${escapeAttr(state.productName)}"
            placeholder="Name"
          />
        </div>

        <div class="space-y-2">
          <label class="font-bold text-gray-800">${t.studio.vibe}</label>
          ${chipButtons(VIBES, state.vibe, "vibe")}
        </div>

        <div class="space-y-2">
          <label class="font-bold text-gray-800">${t.studio.format}</label>
          ${chipButtons(FORMATS, state.format, "format")}
        </div>

        <div class="space-y-2">
          <label class="font-bold text-gray-800">${t.studio.genLanguage}</label>
          ${chipButtons(GEN_LANGUAGES, state.genLanguage, "genLanguage")}
        </div>

        <button data-action="generate"
          class="mt-4 w-full py-4 ${
            state.hasGenerated ? "bg-gradient-to-r from-purple-400 to-blue-400" : TAMU_BLUE
          } text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2"
          ${state.isLoading ? "disabled" : ""}>
          ${state.isLoading ? `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>` : ""}
          <span>${state.isLoading ? t.studio.generating : (state.hasGenerated ? t.studio.regenerate : t.studio.generate)}</span>
        </button>

        ${resultBlock}
      </div>
    </div>
  `;
}

function ProfileView(t) {
  const isDash = state.view === "profile-dashboard";

  const dashboard = `
    <div class="p-5 pb-24 h-full bg-white overflow-y-auto">
      <div class="flex items-center gap-4 mb-6 sticky top-0 bg-white z-10 py-2">
        <button data-action="backProfile" class="p-2 rounded-full bg-gray-100"><i data-lucide="arrow-left" class="w-5 h-5"></i></button>
        <h2 class="text-xl font-bold">${t.profile.dashboard}</h2>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        ${DASHBOARD_STATS.map(s => `
          <div class="p-4 rounded-2xl bg-gray-100">
            <p class="text-2xl font-bold text-gray-800">${s.value}</p>
            <p class="text-xs font-medium text-gray-500">${s.label}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const profile = `
    <div class="p-5 pb-24 h-full">
      <div class="flex items-center gap-4 mb-8 mt-4">
        <div class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kiku" alt="Profile" class="w-full h-full" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">@kadaiku</h2>
          <p class="text-sm text-gray-500">Kiku@kadaiku</p>
        </div>
        <button class="ml-auto p-2 bg-gray-100 rounded-full">
          <i data-lucide="settings" class="w-5 h-5 text-gray-600"></i>
        </button>
      </div>

      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">${t.profile.general}</p>

      <button data-action="goDashboard" class="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between mb-3">
        <div class="text-left">
          <p class="font-bold text-gray-800">${t.profile.dashboard}</p>
        </div>
        <i data-lucide="chevron-right" class="w-5 h-5 text-gray-300"></i>
      </button>

      <div class="space-y-4 mt-6">
        <div class="p-4 rounded-2xl border border-gray-200 shadow-sm">
          <p class="font-bold text-gray-800">${t.profile.language}</p>
          <div class="mt-3 flex gap-2">
            <button data-action="lang" data-lang="en" class="px-4 py-2 rounded-full border ${state.lang === "en" ? "border-blue-500 text-blue-500" : "border-gray-200 text-gray-600"}">English</button>
            <button data-action="lang" data-lang="ms" class="px-4 py-2 rounded-full border ${state.lang === "ms" ? "border-blue-500 text-blue-500" : "border-gray-200 text-gray-600"}">BM</button>
          </div>
        </div>

        <div class="p-4 rounded-2xl border border-gray-200 shadow-sm">
          <p class="font-bold text-gray-800">${t.profile.social}</p>
          <div class="mt-3 space-y-2">
            ${SOCIAL_ACCOUNTS.map(a => `
              <div class="flex items-center justify-between text-sm">
                <span>${a.name}</span>
                <span class="text-xs font-bold ${a.linked ? TEXT_BLUE : "text-gray-400"}">${a.linked ? t.profile.linked : t.profile.link}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <button class="w-full p-4 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-between">
          <span class="flex items-center gap-2"><i data-lucide="log-out" class="w-5 h-5"></i> ${t.profile.logout}</span>
          <i data-lucide="chevron-right" class="w-5 h-5 opacity-50"></i>
        </button>
      </div>
    </div>
  `;

  return isDash ? dashboard : profile;
}

// --- EVENTS / ACTIONS ---
function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.view = btn.getAttribute("data-nav");
      render();
    });
  });

  document.querySelectorAll("[data-go]").forEach(el => {
    el.addEventListener("click", () => {
      state.view = el.getAttribute("data-go");
      render();
    });
  });

  const uploadBox = $("#uploadBox");
  const fileInput = $("#fileInput");
  if (uploadBox && fileInput) {
    uploadBox.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      state.selectedFile = file;
      state.previewUrl = URL.createObjectURL(file);
      state.isVideo = file.type.startsWith("video/");
      render();
    });
  }

  document.querySelectorAll("[data-chip]").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-chip");
      const value = btn.getAttribute("data-value");
      state[name] = value;
      render();
    });
  });

  const productName = $("#productName");
  if (productName) {
    productName.addEventListener("input", (e) => {
      state.productName = e.target.value;
    });
  }

  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const action = btn.getAttribute("data-action");

      if (action === "clearFile") {
        e.stopPropagation();
        if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
        state.selectedFile = null;
        state.previewUrl = null;
        state.isVideo = false;
        render();
        return;
      }

      if (action === "generate") {
        await handleGenerate();
        return;
      }

      if (action === "copy") {
        const box = $("#captionBox");
        if (box) {
          box.select();
          document.execCommand("copy");
        }
        return;
      }

      if (action === "download") {
        await handleDownload();
        return;
      }

      if (action === "tts") {
        await handleTTS();
        return;
      }

      if (action === "share") {
        alert("Demo: connect Meta API posting here.");
        return;
      }

      if (action === "goDashboard") {
        state.view = "profile-dashboard";
        render();
        return;
      }

      if (action === "backProfile") {
        state.view = "profile";
        render();
        return;
      }

      if (action === "lang") {
        state.lang = btn.getAttribute("data-lang");
        render();
        return;
      }
    });
  });
}

async function handleGenerate() {
  const t = TRANSLATIONS[state.lang];

  if (!state.category || !state.productName || !state.vibe || !state.format || !state.genLanguage) {
    alert(t.studio.error);
    return;
  }

  state.isLoading = true;
  state.hasGenerated = false;
  state.caption = "";
  state.strategy = "";
  state.generatedImage = null;
  state.audioUrl = null;
  state.isSpeaking = false;

  render();

  let imageBase64 = null;
  let mimeType = null;

  if (state.selectedFile && !state.isVideo) {
    try {
      imageBase64 = await fileToBase64(state.selectedFile);
      mimeType = state.selectedFile.type;
    } catch {
      // ignore
    }
  }

  const [caption, strategy] = await Promise.all([
    generateContent(state.productName, state.category, state.vibe, state.format, state.genLanguage, imageBase64, mimeType),
    generateStrategy(state.productName, state.category, state.vibe, state.genLanguage)
  ]);

  state.caption = caption;
  state.strategy = strategy;

  // Only attempt Imagen if not video flow
  if (!state.isVideo) {
    state.generatedImage = await generateImage(state.productName, state.category, state.vibe, state.format, state.genLanguage);
  }

  state.isLoading = false;
  state.hasGenerated = true;
  render();
}

async function handleDownload() {
  const safeName = (state.productName || "Content").replace(/[^a-z0-9]/gi, "_");
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);

  try {
    if (state.isVideo && state.selectedFile) {
      const url = URL.createObjectURL(state.selectedFile);
      link.href = url;
      link.download = `TamuGO_${safeName}.mp4`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (state.generatedImage) {
      const res = await fetch(state.generatedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `TamuGO_${safeName}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      alert("Nothing to download yet.");
    }
  } finally {
    document.body.removeChild(link);
  }
}

async function handleTTS() {
  if (state.isSpeaking) {
    state.audio.pause();
    state.isSpeaking = false;
    render();
    return;
  }

  if (state.audioUrl) {
    state.audio.currentTime = 0;
    state.audio.play();
    state.isSpeaking = true;
    render();
    return;
  }

  if (!state.caption) return;

  const url = await generateSpeech(state.caption);
  if (!url) {
    alert("TTS failed. Check API key / model availability.");
    return;
  }

  state.audioUrl = url;
  state.audio.src = url;
  state.audio.play();
  state.isSpeaking = true;
  render();
}

// --- SAFE HTML ---
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}
function escapeAttr(str) {
  return (str || "").replace(/"/g, "&quot;");
}

// Boot
render();
