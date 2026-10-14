import { emailStyles } from "./styles.ts";
import type { BaseEmailContext } from "./types.ts";

interface WrapOptions {
  preheader: string;
  contentHtml: string;
  context: BaseEmailContext;
  showUnsubscribe?: boolean;
}

/**
 * Wraps content HTML into a responsive, bulletproof email layout with header, brand bar, and footer.
 */
export function wrapInBaseEmailLayout(options: WrapOptions): string {
  const { preheader, contentHtml, context, showUnsubscribe = true } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Deutsch Pfad</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="${emailStyles.body}">
  <!-- Invisible Preheader snippet for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f8fafc;">
    ${preheader}
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="${emailStyles.containerTable}">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="${emailStyles.mainCard}">
          
          <!-- German Tricolor Stripe -->
          <tr>
            <td style="${emailStyles.tricolorStripe}"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="${emailStyles.headerPadding}">
              <a href="${context.appUrl || "https://deutschpfad.com"}" target="_blank" style="${emailStyles.logoText}">
                Deutsch<span style="color: #2563eb;">Pfad</span>
              </a>
              <span style="${emailStyles.logoBadge}">German CEFR Path</span>
            </td>
          </tr>

          <!-- Body Content Slot -->
          <tr>
            <td style="${emailStyles.contentPadding}">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="${emailStyles.footer}">
              <p style="margin: 0 0 10px 0;">
                Sent to <strong>${context.recipientEmail}</strong> for your Deutsch Pfad account.
              </p>
              <p style="margin: 0 0 12px 0;">
                <a href="${context.preferencesUrl}" target="_blank" style="${emailStyles.footerLink}">Notification Preferences</a>
                ${
                  showUnsubscribe
                    ? ` &bull; <a href="${context.unsubscribeUrl}" target="_blank" style="${emailStyles.footerLink}">Unsubscribe with 1-click</a>`
                    : ""
                }
                &bull; <a href="${context.appUrl || "https://deutschpfad.com"}/privacy" target="_blank" style="${emailStyles.footerLink}">Privacy Policy</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Deutsch Pfad &bull; Friedrichstraße 100, 10117 Berlin, Germany<br>
                &copy; ${new Date().getFullYear()} Deutsch Pfad. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Wraps plain-text email with clean layout and footer links
 */
export function wrapInBasePlainText(
  bodyText: string,
  context: BaseEmailContext,
  showUnsubscribe: boolean = true
): string {
  const separator = "------------------------------------------------------------";

  return `DEUTSCH PFAD — German Learning Platform
${separator}

${bodyText.trim()}

${separator}
Sent to: ${context.recipientEmail}
Manage Preferences: ${context.preferencesUrl}
${showUnsubscribe ? `1-Click Unsubscribe: ${context.unsubscribeUrl}\n` : ""}Privacy Policy: ${(context.appUrl || "https://deutschpfad.com")}/privacy
Deutsch Pfad • Friedrichstraße 100, 10117 Berlin, Germany
`;
}
