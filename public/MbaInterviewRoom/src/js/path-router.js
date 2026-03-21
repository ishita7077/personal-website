/**
 * MBA Interview Room — path-based URLs (no hash). Prefix: /mba-interview-room
 * Practice: /mba-interview-room/{schoolId}
 * Resources: /mba-interview-room/{schoolId}/resources
 * Custom: /mba-interview-room/custom
 * AI stories: /mba-interview-room/ai-stories
 *
 * (The separate Haas **Interview Room** lives at `/InterviewRoom` — different app in public/InterviewRoom.)
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  IR.MBA_IR_PREFIX = "/mba-interview-room";

  function normPathname() {
    let p = (typeof window !== "undefined" && window.location && window.location.pathname) || "/";
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  }

  IR.parseMbaIrPath = function () {
    const p = normPathname();
    const prefix = IR.MBA_IR_PREFIX;
    if (p === prefix) {
      return { view: "root", schoolId: null };
    }
    if (!p.startsWith(prefix + "/")) {
      return { view: "unknown", schoolId: null };
    }
    const rest = p.slice((prefix + "/").length);
    const parts = rest.split("/").filter(Boolean);
    if (parts.length === 0) {
      return { view: "root", schoolId: null };
    }
    if (parts[0] === "custom") {
      return { view: "custom", schoolId: null };
    }
    if (parts[0] === "ai-stories") {
      return { view: "ai-stories", schoolId: null };
    }
    if (parts.length === 1 && parts[0] === "resources") {
      return { view: "resources-root", schoolId: null };
    }
    if (parts.length === 2 && parts[1] === "resources") {
      return { view: "resources", schoolId: parts[0] };
    }
    if (parts.length === 1) {
      return { view: "practice", schoolId: parts[0] };
    }
    return { view: "unknown", schoolId: null };
  };

  IR.pushMbaIrPath = function (suffix, mode) {
    const suf = (suffix || "").replace(/^\//, "");
    const url = IR.MBA_IR_PREFIX + (suf ? "/" + suf : "");
    if (mode === "replace") {
      history.replaceState({ irPath: true }, "", url);
    } else {
      history.pushState({ irPath: true }, "", url);
    }
  };

  IR.isKnownSchoolId = function (id) {
    if (!id || id === "custom" || id === "ai-stories") return false;
    const list = IR.SCHOOLS_LIST;
    if (list && list.length) {
      return list.some(function (s) {
        return s.id === id;
      });
    }
    return null;
  };

  IR.enterPracticeFromPath = async function (id) {
    if (!IR.fetchSchoolBundle) return;
    try {
      await IR.fetchSchoolBundle(id);
      IR.state.selectedSchool = id;
      IR.state.customMode = false;
      IR.state.permState = "idle";
      IR.navigateTo("techcheck");
      if (IR.ui && IR.ui.renderFormatInfo) IR.ui.renderFormatInfo(id);
      if (IR.ui && IR.ui.renderAlerts) IR.ui.renderAlerts();
      const pt = document.getElementById("placeholderText");
      const pb = document.getElementById("permBlock");
      if (pt) pt.style.display = "";
      if (pb) pb.classList.remove("active");
      IR.updateTopNav();
      if (IR.media && IR.media.requestAccess) await IR.media.requestAccess();
    } catch (e) {
      IR.pushMbaIrPath("", "replace");
      IR.navigateTo("home");
      if (IR.ui && IR.ui.toast) IR.ui.toast("Could not load that programme.", "error");
    }
  };

  IR.syncRouteFromLocation = async function () {
    const parsed = IR.parseMbaIrPath();
    if (parsed.view === "unknown" && normPathname().startsWith(IR.MBA_IR_PREFIX + "/")) {
      IR.pushMbaIrPath("", "replace");
      IR.navigateTo("home");
      return;
    }
    if (parsed.view === "root") {
      IR.navigateTo("home");
      return;
    }
    if (parsed.view === "custom") {
      IR.navigateTo("custom");
      if (IR.updateConfigFromDom) IR.updateConfigFromDom();
      return;
    }
    if (parsed.view === "ai-stories") {
      IR.navigateTo("ai-stories");
      IR.updateTopNav();
      return;
    }
    if (parsed.view === "resources-root") {
      IR.state.selectedSchool = null;
      IR.state.schoolBundle = null;
      IR.state.schoolDisplayName = "";
      IR.state.schoolMeta = null;
      IR.state.schoolResourceSections = [];
      IR.state.answerFrameworkMd = "";
      IR.navigateTo("resources");
      return;
    }
    await IR.fetchSchoolsRegistry().catch(function () {});
    if (parsed.view === "resources" && parsed.schoolId) {
      const known = IR.isKnownSchoolId(parsed.schoolId);
      if (known === false) {
        IR.pushMbaIrPath("", "replace");
        IR.navigateTo("home");
        if (IR.ui && IR.ui.toast) IR.ui.toast("That programme was not found.", "warning");
        return;
      }
      await IR.loadResourcesProgram(parsed.schoolId, { skipPathUpdate: true });
      return;
    }
    if (parsed.view === "practice" && parsed.schoolId) {
      const known = IR.isKnownSchoolId(parsed.schoolId);
      if (known === false) {
        IR.pushMbaIrPath("", "replace");
        IR.navigateTo("home");
        if (IR.ui && IR.ui.toast) IR.ui.toast("That programme was not found.", "warning");
        return;
      }
      await IR.enterPracticeFromPath(parsed.schoolId);
    }
  };

  /**
   * @returns {false|'resources-picker'|'path-updated'} for boot ordering
   */
  IR.legacyHashRedirect = function () {
    const raw = (window.location.hash || "").replace(/^#/, "");
    if (!raw) return false;
    if (raw === "resources") {
      history.replaceState({ irPath: true }, "", IR.MBA_IR_PREFIX + "/resources");
      window.location.hash = "";
      return "resources-picker";
    }
    if (raw.indexOf("resources/") === 0) {
      const id = decodeURIComponent(raw.slice("resources/".length).split("/")[0] || "");
      window.location.hash = "";
      if (id) {
        history.replaceState(
          { irPath: true },
          "",
          IR.MBA_IR_PREFIX + "/" + encodeURIComponent(id) + "/resources"
        );
        return "path-updated";
      }
    }
    return false;
  };
})(typeof window !== "undefined" ? window : this);
