/**
 * MBA Interview Room — school registry and per-programme bundles from `/api/mba-interview-room/*`.
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  IR.schoolCache = IR.schoolCache || {};
  IR.SCHOOLS_LIST = IR.SCHOOLS_LIST || null;

  const API_SCHOOLS = "/api/mba-interview-room/schools";
  const API_SCHOOL = "/api/mba-interview-room/school/";
  const FALLBACK_SCHOOLS = [
    {
      id: "stanford_gsb",
      display_name: "Stanford GSB",
      listing: {
        interview_style_summary:
          "1:1 structured behavioural interview focused on past actions; trained alumni or admissions; ~45–60 minutes; deep probing.",
      },
    },
    {
      id: "hbs",
      display_name: "Harvard Business School",
      listing: {
        interview_style_summary:
          "1:1 application-based interview tailored to your file; ~30 minutes.",
      },
    },
    {
      id: "wharton",
      display_name: "The Wharton School",
      listing: {
        interview_style_summary:
          "Team-based discussion plus a short one-to-one with admissions; real TBD is in a group room.",
      },
    },
    {
      id: "mit_sloan",
      display_name: "MIT Sloan",
      listing: {
        interview_style_summary:
          "1:1 behavioural interview; virtual per official guidance in handoff.",
      },
    },
  ];

  /** Subtle card accents (inspired by programme colours; not official marks). */
  const SCHOOL_ACCENTS = {
    stanford_gsb: "#8c1515",
    hbs: "#a41034",
    wharton: "#011f5b",
    mit_sloan: "#750014",
    chicago_booth: "#800000",
    kellogg: "#4f2582",
    berkeley_haas: "#003262",
    yale_som: "#00356b",
    london_business_school: "#0056a8",
    insead: "#0072a8",
  };

  function apiOrigin() {
    if (typeof window === "undefined" || !window.location) return "";
    return window.location.origin;
  }

  function buildResourceSectionsFromMeta(meta) {
    if (!meta) return [];
    const sections = [];
    const official = meta.secondary_source_urls || [];
    const community = meta.community_source_urls || [];
    if (official.length) {
      sections.push({
        id: "official",
        title: "Official & programme pages",
        blurb:
          "Straight from the school’s own sites—admissions, interviews, culture, and events. Best source of truth for format and expectations.",
        items: official.map(function (url) {
          const inf =
            IR.inferResourceLinkPresentation && IR.inferResourceLinkPresentation(url);
          const title = (inf && inf.title) || "Resource";
          const desc = (inf && inf.description) || "";
          return { name: title, topic: desc, url: url };
        }),
      });
    }
    if (community.length) {
      sections.push({
        id: "community",
        title: "Applicant reports & forums",
        blurb:
          "Third-party write-ups and discussions. Great for real-world colour—never a substitute for the official pages above.",
        items: community.map(function (url) {
          const inf =
            IR.inferResourceLinkPresentation && IR.inferResourceLinkPresentation(url);
          const title = (inf && inf.title) || "Resource";
          const desc = (inf && inf.description) || "";
          return { name: title, topic: desc, url: url };
        }),
      });
    }
    return sections;
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function listingCardBody(name, listing) {
    const L = listing || {};
    const tagline = (L.interview_style_summary || L.unique_hook || "").trim();
    let html =
      '<div class="ir-school-info">' +
      '<div class="ir-school-name">' +
      escapeHtml(name) +
      "</div>";
    if (tagline) {
      html += '<p class="ir-school-tagline">' + escapeHtml(tagline) + "</p>";
    }
    html += "</div>" + '<div class="ir-school-arrow" aria-hidden="true">→</div>';
    return html;
  }

  function applyCardAccent(el, schoolId) {
    if (!el || !schoolId) return;
    const hex = SCHOOL_ACCENTS[schoolId];
    if (hex) {
      el.dataset.schoolId = schoolId;
      el.style.setProperty("--ir-school-accent", hex);
    }
  }

  IR.applySchoolBundle = function (data) {
    if (!data || !data.interviewRoom) return;
    const ir = data.interviewRoom;
    const id = data.schoolId;
    IR.config[id] = {
      id: id,
      school: data.displayName || id,
      program: "MBA",
      totalQuestions: ir.totalQuestions,
      prepTime: ir.prepTime,
      answerTime: ir.answerTime,
      enabled: true,
    };
    IR.state = IR.state || {};
    IR.state.schoolBundle = data;
    IR.state.schoolDisplayName = data.displayName || "";
    const m = data.meta || {};
    IR.state.schoolInterviewSummary = [m.validated_interview_format, m.unique_elements]
      .filter(Boolean)
      .join(" ");
    IR.state.schoolMeta = m;
    IR.state.schoolResourceSections = buildResourceSectionsFromMeta(m);
    IR.state.answerFrameworkMd = data.answerFrameworkMd || "";
  };

  IR.fetchSchoolBundle = async function (schoolId) {
    if (IR.schoolCache[schoolId]) {
      IR.applySchoolBundle(IR.schoolCache[schoolId]);
      return IR.schoolCache[schoolId];
    }
    const url = apiOrigin() + API_SCHOOL + encodeURIComponent(schoolId);
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error("Could not load school data");
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    IR.schoolCache[schoolId] = data;
    IR.applySchoolBundle(data);
    return data;
  };

  IR.fetchSchoolsRegistry = async function () {
    if (IR.SCHOOLS_LIST) return IR.SCHOOLS_LIST;
    if (IR._schoolsRegistryInflight) return IR._schoolsRegistryInflight;
    IR._schoolsRegistryInflight = (async function () {
      try {
        const res = await fetch(apiOrigin() + API_SCHOOLS);
        if (!res.ok) throw new Error("Could not load schools list");
        const data = await res.json();
        IR.SCHOOLS_LIST = (data.schools || []).slice();
        return IR.SCHOOLS_LIST;
      } finally {
        IR._schoolsRegistryInflight = null;
      }
    })();
    return IR._schoolsRegistryInflight;
  };

  IR.renderSchoolCards = function () {
    const mount = document.getElementById("schoolCardsMount");
    if (!mount) return;
    mount.innerHTML = "";

    const list = IR.SCHOOLS_LIST || [];
    list.forEach(function (s) {
      const card = document.createElement("div");
      card.className = "ir-school-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.dataset.schoolId = s.id;
      const L = s.listing || {};
      card.title =
        "Start " + s.display_name + " practice" +
        (L.interview_style_summary ? ". " + L.interview_style_summary.slice(0, 140) : "");
      card.innerHTML = listingCardBody(s.display_name, L);
      applyCardAccent(card, s.id);
      function go() {
        if (IR.selectSchool) IR.selectSchool(s.id);
      }
      card.addEventListener("click", go);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
      mount.appendChild(card);
    });
  };

  IR.initSchoolCards = async function () {
    try {
      await IR.fetchSchoolsRegistry();
      IR.renderSchoolCards();
    } catch (e) {
      IR.SCHOOLS_LIST = FALLBACK_SCHOOLS.slice();
      IR.renderSchoolCards();
    }
  };
})(typeof window !== "undefined" ? window : this);
