/*
  Lightweight i18n for shared UI chrome (nav, footer, common labels/buttons).
  Full-length editorial content (signal logs, party profiles) stays English-only
  in this phase — see the About page's methodology note for why. Static pages
  (About) additionally use data-lang="en|ms|zh|ta" blocks for full translation.
*/
const I18N_DICT = {
  en: {
    nav_overview: "Overview",
    nav_johor: "Johor",
    nav_n9: "Negeri Sembilan",
    nav_parties: "Parties",
    nav_about: "About",
    live_developing: "Developing — refreshed daily",
    live_campaigning: "Campaigning — refreshed daily",
    footer_tagline: "An independent, unofficial tracker of public, party and market sentiment across Malaysia's rolling state election cycle.",
    footer_sections_title: "Sections",
    footer_about_title: "About this site",
    footer_language_title: "Language",
    footer_disclaimer: "Not affiliated with the Election Commission of Malaysia, any political party or coalition, or any government body. Compiled from public news coverage. Logos are used for identification purposes only and remain the property of their respective parties.",
    footer_methodology: "Methodology & sources",
    footer_github: "View source on GitHub",
    footer_updated: "Auto-updated daily",
    lang_note: "Interface shown in",
    lang_note_content_en: "— article content below remains in English.",
    toc_heading: "On this page",
    theme_toggle_label: "Theme",
    parties_eyebrow: "Reference",
    parties_jump: "Jump to a party",
    tab_bn: "Barisan Nasional",
    tab_pn: "Perikatan Nasional",
    tab_ph: "Pakatan Harapan",
    tab_sarawak: "Sarawak",
    tab_sabah: "Sabah",
    tab_other: "Other current",
    tab_historical: "Historical & dismissed",
    field_founded: "Founded",
    field_coalition: "Coalition",
    field_ideology: "Ideology",
    field_keyfigure: "Key figure",
    field_ended: "Ended",
    field_reregistered: "Re-registered",
    field_registered: "Registered",
    h_history: "History & milestones",
    h_legacy: "Legacy",
    h_messaging: "Messaging themes",
    h_perception: "Public perception"
  },
  ms: {
    nav_overview: "Ikhtisar",
    nav_johor: "Johor",
    nav_n9: "Negeri Sembilan",
    nav_parties: "Parti-Parti",
    nav_about: "Tentang",
    live_developing: "Sedang berkembang — dikemaskini setiap hari",
    live_campaigning: "Berkempen — dikemaskini setiap hari",
    footer_tagline: "Penjejak sentimen awam, parti dan pasaran yang bebas dan tidak rasmi sepanjang kitaran pilihan raya negeri Malaysia.",
    footer_sections_title: "Bahagian",
    footer_about_title: "Tentang laman ini",
    footer_language_title: "Bahasa",
    footer_disclaimer: "Tidak berkaitan dengan Suruhanjaya Pilihan Raya Malaysia, mana-mana parti atau gabungan politik, atau badan kerajaan. Disusun daripada liputan berita awam. Logo digunakan semata-mata untuk tujuan pengenalan dan kekal menjadi hak milik parti masing-masing.",
    footer_methodology: "Metodologi & sumber",
    footer_github: "Lihat kod sumber di GitHub",
    footer_updated: "Dikemaskini secara automatik setiap hari",
    lang_note: "Antara muka dipaparkan dalam",
    lang_note_content_en: "— kandungan artikel di bawah kekal dalam Bahasa Inggeris.",
    toc_heading: "Di halaman ini",
    theme_toggle_label: "Tema",
    parties_eyebrow: "Rujukan",
    parties_jump: "Lompat ke parti",
    tab_bn: "Barisan Nasional",
    tab_pn: "Perikatan Nasional",
    tab_ph: "Pakatan Harapan",
    tab_sarawak: "Sarawak",
    tab_sabah: "Sabah",
    tab_other: "Parti semasa lain",
    tab_historical: "Parti sejarah & dibubarkan",
    field_founded: "Ditubuhkan",
    field_coalition: "Gabungan",
    field_ideology: "Ideologi",
    field_keyfigure: "Tokoh utama",
    field_ended: "Tamat",
    field_reregistered: "Didaftar semula",
    field_registered: "Didaftarkan",
    h_history: "Sejarah & detik penting",
    h_legacy: "Warisan",
    h_messaging: "Tema mesej",
    h_perception: "Persepsi awam"
  },
  zh: {
    nav_overview: "总览",
    nav_johor: "柔佛",
    nav_n9: "森美兰",
    nav_parties: "政党",
    nav_about: "关于",
    live_developing: "持续更新 — 每日更新",
    live_campaigning: "竞选中 — 每日更新",
    footer_tagline: "一个独立、非官方的追踪平台，记录马来西亚各州选举周期中的民意、政党与市场情绪。",
    footer_sections_title: "栏目",
    footer_about_title: "关于本网站",
    footer_language_title: "语言",
    footer_disclaimer: "本网站与马来西亚选举委员会、任何政党或联盟、或任何政府机构均无关联。内容整理自公开新闻报道。政党标志仅作识别用途，其权利归属各政党所有。",
    footer_methodology: "方法与资料来源",
    footer_github: "在 GitHub 查看源代码",
    footer_updated: "每日自动更新",
    lang_note: "界面显示语言为",
    lang_note_content_en: "— 以下文章内容仍为英文。",
    toc_heading: "本页内容",
    theme_toggle_label: "主题",
    parties_eyebrow: "参考资料",
    parties_jump: "快速跳转至政党",
    tab_bn: "国民阵线",
    tab_pn: "国民联盟",
    tab_ph: "希望联盟",
    tab_sarawak: "砂拉越",
    tab_sabah: "沙巴",
    tab_other: "其他现有政党",
    tab_historical: "历史与已解散政党",
    field_founded: "成立于",
    field_coalition: "所属联盟",
    field_ideology: "意识形态",
    field_keyfigure: "关键人物",
    field_ended: "解散于",
    field_reregistered: "重新注册",
    field_registered: "注册于",
    h_history: "历史与重要里程碑",
    h_legacy: "历史影响",
    h_messaging: "宣传主题",
    h_perception: "公众看法"
  },
  ta: {
    nav_overview: "மேலோட்டம்",
    nav_johor: "ஜொகூர்",
    nav_n9: "நெகிரி செம்பிலான்",
    nav_parties: "கட்சிகள்",
    nav_about: "எங்களைப் பற்றி",
    live_developing: "வளர்ந்து வருகிறது — தினமும் புதுப்பிக்கப்படுகிறது",
    live_campaigning: "பிரச்சாரம் நடைபெறுகிறது — தினமும் புதுப்பிக்கப்படுகிறது",
    footer_tagline: "மலேசியாவின் தொடர் மாநில தேர்தல் சுழற்சி முழுவதும் பொது, கட்சி மற்றும் சந்தை உணர்வுகளை கண்காணிக்கும் ஒரு சுயாதீன, அதிகாரப்பூர்வமற்ற தளம்.",
    footer_sections_title: "பிரிவுகள்",
    footer_about_title: "இந்த தளத்தைப் பற்றி",
    footer_language_title: "மொழி",
    footer_disclaimer: "மலேசியா தேர்தல் ஆணையம், எந்தவொரு அரசியல் கட்சி அல்லது கூட்டணி, அல்லது எந்த அரசாங்க அமைப்புடனும் இது தொடர்பில்லை. பொது செய்தி அறிக்கைகளிலிருந்து தொகுக்கப்பட்டது. சின்னங்கள் அடையாளம் காணும் நோக்கத்திற்காக மட்டுமே பயன்படுத்தப்படுகின்றன.",
    footer_methodology: "முறைமை & ஆதாரங்கள்",
    footer_github: "GitHub இல் மூலக் குறியீட்டைக் காண்க",
    footer_updated: "தினமும் தானாக புதுப்பிக்கப்படுகிறது",
    lang_note: "இடைமுகம் காட்டப்படும் மொழி",
    lang_note_content_en: "— கீழே உள்ள கட்டுரை உள்ளடக்கம் ஆங்கிலத்தில் உள்ளது.",
    toc_heading: "இந்தப் பக்கத்தில்",
    theme_toggle_label: "தீம்",
    parties_eyebrow: "குறிப்பு",
    parties_jump: "ஒரு கட்சிக்கு செல்லவும்",
    tab_bn: "பாரிசான் நேஷனல்",
    tab_pn: "பெரிக்காத்தான் நேஷனல்",
    tab_ph: "பாகாத்தான் ஹரபான்",
    tab_sarawak: "சரவாக்",
    tab_sabah: "சபா",
    tab_other: "பிற தற்போதைய கட்சிகள்",
    tab_historical: "வரலாற்று & கலைக்கப்பட்ட கட்சிகள்",
    field_founded: "நிறுவப்பட்டது",
    field_coalition: "கூட்டணி",
    field_ideology: "சித்தாந்தம்",
    field_keyfigure: "முக்கிய நபர்",
    field_ended: "முடிவடைந்தது",
    field_reregistered: "மீண்டும் பதிவு செய்யப்பட்டது",
    field_registered: "பதிவு செய்யப்பட்டது",
    h_history: "வரலாறு & மைல்கற்கள்",
    h_legacy: "பாரம்பரியம்",
    h_messaging: "செய்தி கருப்பொருள்கள்",
    h_perception: "பொது கருத்து"
  }
};

(function () {
  const STORAGE_KEY = "site-lang";
  const THEME_KEY = "site-theme";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || "en";
  }

  function applyLang(lang) {
    if (!I18N_DICT[lang]) lang = "en";
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : lang);
    const dict = I18N_DICT[lang];
    const fallback = I18N_DICT.en;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      el.textContent = dict[key] || fallback[key] || el.textContent;
    });

    document.querySelectorAll("[data-lang]").forEach(function (el) {
      const target = el.getAttribute("data-lang");
      el.style.display = target === lang ? "" : "none";
    });

    document.querySelectorAll(".lang-switch a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-set-lang") === lang);
    });

    document.querySelectorAll("[data-lang-note]").forEach(function (el) {
      const names = { en: "English", ms: "Bahasa Malaysia", zh: "中文", ta: "தமிழ்" };
      el.style.display = lang === "en" ? "none" : "block";
      const label = el.querySelector(".lang-note-label");
      if (label) label.textContent = (dict.lang_note || fallback.lang_note) + " " + names[lang] + " " + (dict.lang_note_content_en || fallback.lang_note_content_en);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "auto";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "auto") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    document.querySelectorAll(".theme-switch button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-set-theme") === theme);
    });
    localStorage.setItem(THEME_KEY, theme);
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(getLang());
    applyTheme(getTheme());

    document.querySelectorAll(".lang-switch a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        applyLang(a.getAttribute("data-set-lang"));
      });
    });

    document.querySelectorAll(".theme-switch button").forEach(function (b) {
      b.addEventListener("click", function () {
        applyTheme(b.getAttribute("data-set-theme"));
      });
    });
  });
})();
