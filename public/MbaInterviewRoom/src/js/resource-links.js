/**
 * MBA Interview Room — human-readable titles and blurbs for resource URLs (dataset lists).
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  function titleCase(s) {
    return String(s || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function hostNoWww(h) {
    return String(h || "").replace(/^www\./i, "");
  }

  /**
   * @returns {{ title: string, description: string }}
   */
  IR.inferResourceLinkPresentation = function (url) {
    const raw = String(url || "").trim();
    if (!raw) {
      return { title: "Link", description: "" };
    }
    let u;
    try {
      u = new URL(raw);
    } catch (e) {
      return { title: "Resource", description: raw };
    }
    const host = hostNoWww(u.hostname).toLowerCase();
    const path = (u.pathname || "/").toLowerCase();
    const full = host + path;

    const redditCommunity =
      "Recent applicant perspectives on Reddit—helpful for texture; treat as anecdotal, not official guidance.";
    const clearAdmitReports =
      "Crowdsourced interview write-ups from past applicants—use for examples and tone, not as guarantees.";
    const gmatClub = "GMAT Club discussion with candidate tips and experiences.";

    if (host.includes("reddit.com")) {
      return { title: "Applicant discussion on Reddit", description: redditCommunity };
    }
    if (host.includes("clearadmit.com")) {
      if (path.includes("interview-reports") || path.includes("/schools/")) {
        return { title: "Clear Admit — interview reports & school hub", description: clearAdmitReports };
      }
      return { title: "Clear Admit article", description: clearAdmitReports };
    }
    if (host.includes("gmatclub.com")) {
      return { title: "GMAT Club forum discussion", description: gmatClub };
    }

    if (full.includes("gsb.stanford.edu")) {
      if (path.includes("/admission/ambassadors")) {
        return {
          title: "MBA ambassadors",
          description: "Meet current students and learn about the Stanford MBA from the official admissions site.",
        };
      }
      if (path.includes("student-experience-life-gsb")) {
        return {
          title: "Student experience webinar / event",
          description: "Official session on life at Stanford GSB.",
        };
      }
      if (path.endsWith("/mba") || path.endsWith("/programs/mba")) {
        return {
          title: "Full-Time MBA overview",
          description: "Programme overview, structure, and admissions entry point.",
        };
      }
    }

    if (host.includes("hbs.edu")) {
      if (path.includes("your-interview")) {
        return {
          title: "Interview information",
          description: "Harvard’s official interview guidance and what to expect.",
        };
      }
      if (path.includes("get-to-know-us")) {
        return { title: "Get to know HBS", description: "Official pages to understand culture and community." };
      }
      if (path.includes("application-process")) {
        return { title: "Application process", description: "How the HBS application and review process works." };
      }
      if (path.includes("/blog/")) {
        return { title: "HBS MBA blog", description: "Stories and updates from the admissions team." };
      }
    }

    if (host.includes("wharton.upenn.edu") || host.includes("mba.wharton.upenn.edu")) {
      if (path.includes("team-based") || path.includes("tbd")) {
        return {
          title: "Team-Based Discussion",
          description: "Wharton’s group interview format and how it fits the process.",
        };
      }
      if (path.includes("interview")) {
        return { title: "Interview process", description: "Official Wharton interview steps and timing." };
      }
      if (path.includes("events")) {
        return { title: "Admissions event", description: "Register for a session or replay from Wharton MBA admissions." };
      }
    }

    if (host.includes("chicagobooth.edu") || host.includes("news.chicagobooth.edu")) {
      if (path.includes("leadership-impact") || path.includes("why-booth")) {
        return { title: "Why Booth — culture & leadership", description: "How Booth frames leadership and community." };
      }
      if (path.includes("admissions") || path.includes("how-to-apply")) {
        return { title: "Admissions & how to apply", description: "Official application and interview context." };
      }
    }

    if (host.includes("kellogg.northwestern.edu")) {
      if (path.includes("how-to-apply") || path.includes("ft-admissions")) {
        return { title: "How to apply", description: "Kellogg admissions steps, interviews, and blind-interview context." };
      }
      if (path.includes("blog")) {
        return { title: "Kellogg news / blog", description: "Programme updates and community stories." };
      }
      if (path.includes("two-year-mba") || path.includes("full-time-mba")) {
        return { title: "Full-Time MBA programme", description: "Curriculum and programme structure." };
      }
    }

    if (host.includes("haas.berkeley.edu") || host.includes("mba.haas.berkeley.edu")) {
      if (path.includes("/interview")) {
        return { title: "Interview information", description: "Official Haas interview options and expectations." };
      }
      if (path.includes("defining-principles")) {
        return { title: "Defining Leadership Principles", description: "Core values Haas uses to assess fit and stories." };
      }
      if (path.includes("admissions")) {
        return { title: "Admissions overview", description: "How to apply and what the admissions team evaluates." };
      }
    }

    if (host.includes("mitsloan.mit.edu")) {
      if (path.includes("admissions")) {
        return { title: "MBA admissions", description: "Sloan application steps, interview, and pre-interview materials." };
      }
    }

    if (host.includes("som.yale.edu") || host.includes("admissions.som.yale.edu")) {
      if (path.includes("application") || path.includes("faq")) {
        return { title: "Application guide or FAQ", description: "Yale SOM official application and interview context." };
      }
      if (path.includes("mission") || path.includes("experience")) {
        return { title: "Mission & student experience", description: "How Yale SOM describes its community and purpose." };
      }
      if (path.includes("register")) {
        return { title: "Live admissions Q&A session", description: "Sign up for a live admissions session." };
      }
    }

    if (host.includes("london.edu") || host.includes("admissionsblog.london.edu")) {
      if (path.includes("admissionsblog")) {
        return { title: "Admissions blog", description: "LBS admissions team articles on applying and interviews." };
      }
      if (path.includes("apply") || path.includes("mba")) {
        return { title: "MBA admissions", description: "Official LBS MBA application and process information." };
      }
    }

    if (host.includes("insead.edu") || host.includes("intheknow.insead.edu")) {
      if (path.includes("video") || path.includes("blog")) {
        return { title: "Admissions video or article", description: "INSEAD guidance on the application and video assessment." };
      }
      if (path.includes("application-process") || path.includes("events")) {
        return { title: "Application process or event", description: "Official INSEAD MBA admissions information." };
      }
    }

    const segments = u.pathname.split("/").filter(Boolean);
    const last = segments.length ? segments[segments.length - 1] : "";
    const fallbackTitle = last ? titleCase(decodeURIComponent(last).replace(/\.[a-z]+$/i, "")) : titleCase(host.split(".")[0] || "Resource");
    return {
      title: fallbackTitle,
      description: "Opens on " + host + " — use for programme-specific context while you prepare.",
    };
  };
})(typeof window !== "undefined" ? window : this);
