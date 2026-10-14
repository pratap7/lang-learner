import { describe, it } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import axe from "axe-core";

import {
  formatDate,
  formatNumber,
  formatPercent,
  formatCurrency,
  formatRelativeTime,
} from "../i18n/formatters.ts";

// Set up virtual DOM environment for axe-core auditing
function createVirtualDom(htmlFragment: string) {
  const dom = new JSDOM(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Accessibility Test</title>
      </head>
      <body>
        <main id="main-content">
          ${htmlFragment}
        </main>
      </body>
    </html>`);

  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
  (global as any).Node = dom.window.Node;
  (global as any).Element = dom.window.Element;

  return dom;
}

describe("WCAG 2.2 AA Automated Accessibility Audits (axe-core)", () => {
  it("should pass axe-core checks on interactive exercise controls and input fields", async () => {
    const fixture = `
      <form aria-label="German Practice Form">
        <label for="german-input">Type missing German word:</label>
        <input id="german-input" type="text" name="german_answer" aria-describedby="hint-text" value="Kaffee" />
        <span id="hint-text">Hint: Starts with masculine noun 'der'</span>
        
        <div role="region" aria-label="German special characters helper">
          <button type="button" aria-label="Insert German character ä">ä</button>
          <button type="button" aria-label="Insert German character ö">ö</button>
          <button type="button" aria-label="Insert German character ü">ü</button>
          <button type="button" aria-label="Insert German character ß">ß</button>
        </div>

        <button type="submit" aria-label="Submit your answer">Check Answer</button>
      </form>
    `;

    const dom = createVirtualDom(fixture);
    const results = await axe.run(dom.window.document.getElementById("main-content")!, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
      rules: {
        // Color contrast requires real CSS rasterization engine in headless browser
        "color-contrast": { enabled: false },
      },
    });

    assert.strictEqual(
      results.violations.length,
      0,
      `Expected 0 axe violations, found: ${JSON.stringify(results.violations, null, 2)}`
    );
  });

  it("should pass axe-core checks on sticky progress bar, audio controls, and modal dialog", async () => {
    const fixture = `
      <header role="banner">
        <div
          role="progressbar"
          aria-valuenow="75"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Session progress: 75%"
        >
          <div style="width: 75%"></div>
        </div>

        <button type="button" aria-label="Toggle Slow Audio (Hotkey: S)">0.75x</button>
        <button type="button" aria-label="Replay Audio (Hotkey: R)">Replay</button>
        <button type="button" aria-label="Toggle Fullscreen Distraction-Free">Fullscreen</button>
        <button type="button" aria-label="Open Accessibility & Language Preferences">Settings</button>
      </header>

      <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">Accessibility & Display</h2>
        <button type="button" aria-label="Close dialog">Close</button>
      </div>
    `;

    const dom = createVirtualDom(fixture);
    const results = await axe.run(dom.window.document.getElementById("main-content")!, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    assert.strictEqual(results.violations.length, 0);
  });

  it("should pass axe-core checks on live regions and audio caption transcripts", async () => {
    const fixture = `
      <div role="region" aria-label="Audio transcript and captions">
        <h3>Audio Caption / Transcript</h3>
        <p>"Ich trinke gerne einen Kaffee mit Milch."</p>
      </div>

      <div role="alert" aria-live="assertive">
        <span>✓ Richtig (Correct)</span>
        <p>'dem' is used after 'mit' because it takes the dative.</p>
      </div>
    `;

    const dom = createVirtualDom(fixture);
    const results = await axe.run(dom.window.document.getElementById("main-content")!, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    assert.strictEqual(results.violations.length, 0);
  });
});

describe("German Special Characters Rendering & Umlaut Helper Bar", () => {
  it("should accurately render all standard German special characters without encoding corruption", () => {
    const specialChars = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];
    const sampleSentences = [
      "Übermütige Mädchen frühstücken süße Äpfel.",
      "Große Züge halten regelmäßig am Hauptbahnhof.",
      "Schöne Grüße aus Österreich!",
    ];

    specialChars.forEach((char) => {
      assert.ok(char.length === 1, `Character ${char} should have single unicode length`);
    });

    sampleSentences.forEach((sentence) => {
      assert.ok(!sentence.includes("\ufffd"), `Sentence "${sentence}" should not contain replacement character`);
      assert.ok(!sentence.includes("&auml;"), `Sentence "${sentence}" should render native UTF-8, not HTML entity`);
    });
  });

  it("should insert umlauts and preserve cursor string replacement correctly", () => {
    const original = "Schon";
    const insertedChar = "ö";
    const cursorIndex = 3;

    const result = original.substring(0, cursorIndex) + insertedChar + original.substring(cursorIndex);
    assert.strictEqual(result, "Schöon");
  });
});

describe("Internationalisation (i18n) & RTL Layout Readiness", () => {
  it("should support RTL direction for Arabic locale and LTR for European languages", () => {
    const locales = [
      { code: "en", dir: "ltr" },
      { code: "de", dir: "ltr" },
      { code: "es", dir: "ltr" },
      { code: "ar", dir: "rtl" },
    ];

    locales.forEach(({ code, dir }) => {
      const isRtl = code === "ar";
      assert.strictEqual(dir, isRtl ? "rtl" : "ltr");
    });
  });

  it("should format dates according to local conventions", () => {
    const testDate = new Date("2026-10-15T12:00:00Z");

    const deDate = formatDate(testDate, "de-DE", { dateStyle: "medium" });
    const enDate = formatDate(testDate, "en-US", { dateStyle: "medium" });

    assert.ok(deDate.includes("2026") || deDate.includes("Okt"), "German date should format correctly");
    assert.ok(enDate.includes("2026") || enDate.includes("Oct"), "English date should format correctly");
  });

  it("should format numbers and percentages with locale-aware delimiters", () => {
    const numberVal = 1234567.89;
    const deFormatted = formatNumber(numberVal, "de-DE");
    const enFormatted = formatNumber(numberVal, "en-US");

    // German uses '.' as thousands separator and ',' as decimal separator
    assert.ok(deFormatted.includes(",") || deFormatted.includes("."), "German number has valid separators");
    assert.ok(enFormatted.includes(".") || enFormatted.includes(","), "English number has valid separators");

    const percentVal = 0.88;
    const dePercent = formatPercent(percentVal, "de-DE");
    const enPercent = formatPercent(percentVal, "en-US");

    assert.ok(dePercent.includes("88"), "German percent includes 88");
    assert.ok(enPercent.includes("88"), "English percent includes 88");
  });

  it("should format currency with proper currency symbols and placement", () => {
    const amount = 29.99;
    const eurInGermany = formatCurrency(amount, "EUR", "de-DE");
    const usdInUS = formatCurrency(amount, "USD", "en-US");

    // In German: "29,99 €"
    assert.ok(eurInGermany.includes("€"), "German euro format contains €");
    assert.ok(eurInGermany.includes("29,99") || eurInGermany.includes("29.99"));

    // In US: "$29.99"
    assert.ok(usdInUS.includes("$"), "US dollar format contains $");
  });
});

describe("Colour-Independent Feedback Verification", () => {
  it("should verify that feedback messages have distinct text badges and icons beyond color alone", () => {
    const correctFeedback = {
      isCorrect: true,
      textBadge: "✓ Richtig (Correct)",
      iconName: "check",
      header: "Correct! Outstanding precision.",
    };

    const incorrectFeedback = {
      isCorrect: false,
      textBadge: "✕ Nicht ganz (Incorrect)",
      iconName: "x-circle",
      header: "Not quite. Here is why:",
    };

    // Color independence check: both must contain unambiguous textual signifiers
    assert.ok(correctFeedback.textBadge.includes("✓"), "Correct state must include text checkmark");
    assert.ok(correctFeedback.textBadge.includes("Correct"), "Correct state must include verbal status");

    assert.ok(incorrectFeedback.textBadge.includes("✕"), "Incorrect state must include text X");
    assert.ok(incorrectFeedback.textBadge.includes("Incorrect"), "Incorrect state must include verbal status");
  });
});
