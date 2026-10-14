/**
 * Bulletproof Inline CSS Styles for Deutsch Pfad Email Templates
 * Tested for compatibility across Gmail, Outlook, Apple Mail, and mobile clients.
 */

export const emailStyles = {
  // Canvas
  body: `
    margin: 0;
    padding: 0;
    width: 100% !important;
    background-color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  `,
  containerTable: `
    width: 100%;
    background-color: #f8fafc;
    padding: 32px 16px;
  `,
  mainCard: `
    width: 100%;
    max-width: 580px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  `,

  // Brand Header
  tricolorStripe: `
    height: 4px;
    width: 100%;
    background: linear-gradient(90deg, #1e293b 0%, #1e293b 33.3%, #dc2626 33.3%, #dc2626 66.6%, #f59e0b 66.6%, #f59e0b 100%);
  `,
  headerPadding: `
    padding: 28px 32px 20px 32px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  `,
  logoText: `
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #0f172a;
    text-decoration: none;
    display: inline-block;
  `,
  logoBadge: `
    display: inline-block;
    padding: 3px 8px;
    margin-left: 8px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 6px;
    background-color: #eff6ff;
    color: #2563eb;
    vertical-align: middle;
  `,

  // Content Area
  contentPadding: `
    padding: 32px;
  `,
  h1: `
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.5px;
    color: #0f172a;
  `,
  p: `
    margin: 0 0 16px 0;
    font-size: 15px;
    line-height: 1.6;
    color: #334155;
  `,
  pMuted: `
    margin: 0 0 16px 0;
    font-size: 13px;
    line-height: 1.5;
    color: #64748b;
  `,

  // Action Buttons
  btnPrimary: `
    display: inline-block;
    background-color: #2563eb;
    color: #ffffff !important;
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;
    padding: 13px 28px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
  `,
  btnSecondary: `
    display: inline-block;
    background-color: #f1f5f9;
    color: #1e293b !important;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    padding: 11px 22px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #cbd5e1;
  `,

  // Stat / Callout Box
  calloutBox: `
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  `,
  calloutSuccess: `
    background-color: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  `,
  calloutWarning: `
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  `,
  calloutError: `
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  `,

  // Key Value Table for Invoices & Summaries
  table: `
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  `,
  th: `
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
  `,
  td: `
    font-size: 14px;
    color: #1e293b;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
  `,
  tdBold: `
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
  `,

  // Verification Code Box
  codeBox: `
    background-color: #f1f5f9;
    border: 2px dashed #94a3b8;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 6px;
    color: #0f172a;
    margin: 20px 0;
  `,

  // Footer
  footer: `
    padding: 24px 32px;
    background-color: #f8fafc;
    border-top: 1px solid #f1f5f9;
    text-align: center;
    font-size: 12px;
    line-height: 1.6;
    color: #64748b;
  `,
  footerLink: `
    color: #475569;
    text-decoration: underline;
  `,
};
