/**
 * MBA Interview Room — turn programme answer_framework.md into readable HTML; drop duplicate URL blocks.
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  /** Remove handoff intro, duplicate URL lists, and build footer — cards cover links. */
  function stripForDisplay(md) {
    let t = String(md || "");
    const ev = t.search(/\n## Evidence taxonomy\b/);
    if (ev !== -1) {
      t = t.slice(ev + 1).trim();
    }
    t = t.replace(/\n## School-affiliated sources[\s\S]*?(?=\n## How to answer\b)/m, "");
    t = t.replace(/\n## Community \/ applicant texture[\s\S]*?(?=\n## How to answer\b)/m, "");
    t = t.replace(/\n## Community & applicant texture[\s\S]*?(?=\n## How to answer\b)/m, "");
    t = t.replace(/\n---[\s\S]*$/m, "");
    return t.trim();
  }

  function inlineFormat(line) {
    let s = escapeHtml(line);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    return s;
  }

  /** Strip internal phrasing from ## headings before render. */
  function polishHeadingContent(raw) {
    let s = String(raw || "").trim();
    s = s.replace(/\s*\(programmatic targets\)\s*/gi, "").trim();
    s = s.replace(/\s*\(shared\)\s*/gi, "").trim();
    if (/^evidence taxonomy$/i.test(s)) {
      return "Story types to prepare";
    }
    return s;
  }

  /**
   * Turn snake_case / slash labels (e.g. leadership_story, failure / resilience) into title-style copy.
   */
  function humanizeStoryTypeLabel(text) {
    const raw = String(text || "").trim();
    if (!raw) return raw;
    if (!/_/.test(raw) && raw.indexOf("/") === -1) {
      return raw;
    }
    function segmentToPhrase(segment) {
      const t = segment.trim();
      if (!t) return "";
      const words = t.split("_").filter(Boolean).map(function (w) {
        const lower = w.toLowerCase();
        if (lower === "mba") return "MBA";
        return lower;
      });
      const joined = words.join(" ");
      return joined.charAt(0).toUpperCase() + joined.slice(1);
    }
    return raw
      .split(/\s*\/\s*/)
      .map(segmentToPhrase)
      .filter(Boolean)
      .join(" · ");
  }

  function polishTableHeaderCell(text) {
    const t = String(text || "").trim();
    if (/^evidence type$/i.test(t)) return "Type of example";
    if (/^use$/i.test(t)) return "What to show";
    return t;
  }

  function formatTableCell(content, colIndex, isHeader, headerRow) {
    const raw = String(content || "").trim();
    if (isHeader) {
      return inlineFormat(polishTableHeaderCell(raw));
    }
    if (
      colIndex === 0 &&
      headerRow &&
      headerRow[0] &&
      /^evidence type$/i.test(String(headerRow[0]).trim())
    ) {
      return inlineFormat(humanizeStoryTypeLabel(raw));
    }
    return inlineFormat(raw);
  }

  function splitMdTableRow(line) {
    const raw = line.trim();
    if (!raw.startsWith("|") || !raw.endsWith("|")) return null;
    return raw
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
  }

  /**
   * Minimal markdown → HTML (headers, lists, tables, paragraphs). Input is trusted (repo dataset).
   */
  IR.frameworkMdToHtml = function (md) {
    const text = stripForDisplay(md);
    if (!text) return "";

    const lines = text.split(/\r?\n/);
    const out = [];
    let i = 0;
    let inUl = false;
    const closeUl = () => {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        closeUl();
        i++;
        continue;
      }

      if (trimmed.startsWith("## ")) {
        closeUl();
        out.push("<h3>" + inlineFormat(polishHeadingContent(trimmed.slice(3))) + "</h3>");
        i++;
        continue;
      }
      if (trimmed.startsWith("### ")) {
        closeUl();
        out.push("<h4>" + inlineFormat(polishHeadingContent(trimmed.slice(4))) + "</h4>");
        i++;
        continue;
      }

      const row0 = splitMdTableRow(trimmed);
      if (row0 && row0.length >= 2) {
        closeUl();
        const rows = [row0];
        i++;
        if (i < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i].trim())) {
          i++;
        }
        while (i < lines.length) {
          const r = splitMdTableRow(lines[i]);
          if (!r || !r.length) break;
          rows.push(r);
          i++;
        }
        const headerRow = rows[0] || [];
        const isEvidenceTable =
          headerRow[0] && /^evidence type$/i.test(String(headerRow[0]).trim());
        const tableClass = isEvidenceTable ? "ir-fw-table ir-fw-table-evidence" : "ir-fw-table";
        out.push('<div class="ir-fw-table-wrap"><table class="' + tableClass + '"><thead><tr>');
        headerRow.forEach((c, idx) => out.push("<th>" + formatTableCell(c, idx, true, headerRow) + "</th>"));
        out.push("</tr></thead><tbody>");
        for (let r = 1; r < rows.length; r++) {
          out.push("<tr>");
          rows[r].forEach((c, idx) => out.push("<td>" + formatTableCell(c, idx, false, headerRow) + "</td>"));
          out.push("</tr>");
        }
        out.push("</tbody></table></div>");
        continue;
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inUl) {
          out.push("<ul>");
          inUl = true;
        }
        out.push("<li>" + inlineFormat(trimmed.slice(2)) + "</li>");
        i++;
        continue;
      }

      if (/^\d+\.\s/.test(trimmed)) {
        closeUl();
        const items = [];
        let start = 1;
        while (i < lines.length) {
          const ol = lines[i].trim();
          const mm = ol.match(/^(\d+)\.\s+(.*)$/);
          if (!mm) break;
          if (items.length === 0) start = parseInt(mm[1], 10) || 1;
          items.push(mm[2]);
          i++;
        }
        out.push("<ol start='" + start + "'>");
        items.forEach((it) => out.push("<li>" + inlineFormat(it) + "</li>"));
        out.push("</ol>");
        continue;
      }

      closeUl();
      out.push("<p>" + inlineFormat(trimmed) + "</p>");
      i++;
    }
    closeUl();
    return out.join("\n");
  };
})(typeof window !== "undefined" ? window : this);
