/**
 * MBA Interview Room — school registry and per-programme bundles from `/api/mba-interview-room/*`.
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  IR.schoolCache = IR.schoolCache || {};
  IR.SCHOOLS_LIST = IR.SCHOOLS_LIST || null;

  const API_SCHOOLS = "/api/mba-interview-room/schools";
  const API_SCHOOL = "/api/mba-interview-room/school/";

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

  /** Listing copy for the Berkeley Haas card (not included in `/api/mba-interview-room/schools`). */
  const HAAS_LINK_LISTING = {
    interview_style_summary:
      "Invitation-only; prerecorded video and/or live remote options.",
    unique_hook:
      "Defining Leadership Principles as cultural lens; dynamic interview options per official interview page (step4).",
    interviewer_profile: "Student or alum for live remote",
    practice_mechanics:
      "Up to 6 prompts · 45s prep / 3 min answer · 7 rotating six-question sets",
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
        title: "School-affiliated links",
        blurb:
          "From the handoff secondary-sources pack (official and school-affiliated URLs).",
        items: official.map(function (url) {
          return {
            name: url.replace(/^https?:\/\//, "").split("/")[0] || "Link",
            topic: url,
            url: url,
          };
        }),
      });
    }
    if (community.length) {
      sections.push({
        id: "community",
        title: "Community & applicant texture",
        blurb: "From the handoff community pack — patterns and timing, not guarantees.",
        items: community.map(function (url) {
          return {
            name: url.replace(/^https?:\/\//, "").split("/")[0] || "Link",
            topic: url,
            url: url,
          };
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
    const style = L.interview_style_summary;
    const hook = L.unique_hook;
    const mech = L.practice_mechanics;
    const who = L.interviewer_profile;
    let html =
      '<div class="ir-school-info">' +
      '<div class="ir-school-name">' +
      escapeHtml(name) +
      "</div>";
    if (style) {
      html += '<p class="ir-school-style">' + escapeHtml(style) + "</p>";
    }
    if (hook) {
      html += '<p class="ir-school-hook">' + escapeHtml(hook) + "</p>";
    }
    if (mech) {
      html += '<p class="ir-school-practice">' + escapeHtml(mech) + "</p>";
    }
    if (who) {
      html +=
        '<p class="ir-school-who">' +
        escapeHtml("Likely interviewer: " + who) +
        "</p>";
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
    const res = await fetch(apiOrigin() + API_SCHOOLS);
    if (!res.ok) throw new Error("Could not load schools list");
    const data = await res.json();
    IR.SCHOOLS_LIST = (data.schools || []).slice();
    return IR.SCHOOLS_LIST;
  };

  IR.renderSchoolCards = function () {
    const mount = document.getElementById("schoolCardsMount");
    if (!mount) return;
    mount.innerHTML = "";

    const haas = document.createElement("a");
    haas.className = "ir-school-card ir-school-card-link";
    haas.href = "/InterviewRoom";
    haas.target = "_top";
    haas.rel = "noopener noreferrer";
    haas.title = "UC Berkeley Haas — practice at /InterviewRoom";
    haas.innerHTML = listingCardBody("UC Berkeley Haas", HAAS_LINK_LISTING);
    haas.classList.add("ir-school-card-haas");
    applyCardAccent(haas, "berkeley_haas");
    mount.appendChild(haas);

    const list = IR.SCHOOLS_LIST || [];
    list.forEach(function (s) {
      const card = document.createElement("div");
      card.className = "ir-school-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.dataset.schoolId = s.id;
      const L = s.listing || {};
      card.title =
        "Start " +
        s.display_name +
        " practice — " +
        (L.interview_style_summary || "").slice(0, 120);
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
      const mount = document.getElementById("schoolCardsMount");
      if (mount) {
        mount.innerHTML =
          '<p class="ir-school-load-error">Could not load programme list. Serve this app from the site (e.g. <code>/mba-interview-room</code>) so <code>' +
          API_SCHOOLS +
          "</code> is reachable.</p>";
      }
    }
  };
})(typeof window !== "undefined" ? window : this);
