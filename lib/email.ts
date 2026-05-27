// Shared HTML email template helpers — all emails go through emailBase()

const BRAND = "#C4622D";
const DARK = "#1A2332";

export function emailBase(content: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="background:${BRAND};border-radius:10px 10px 0 0;padding:18px 28px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">RentNest</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:28px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:14px 28px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">RentNest · Modern property management</p>
              <p style="margin:4px 0 0;color:#d1d5db;font-size:11px;">© ${year} RentNest. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ep(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;
}

export function greeting(name: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Hi <strong style="color:${DARK};">${name}</strong>,</p>`;
}

export function btn(label: string, url: string): string {
  return `<p style="margin:20px 0 8px;"><a href="${url}" style="display:inline-block;background:${BRAND};color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${label}</a></p>`;
}

export function emailBlockquote(text: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
    <tr>
      <td style="border-left:3px solid ${BRAND};padding:12px 16px;background:#fdf8f5;border-radius:0 6px 6px 0;">
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">${text}</p>
      </td>
    </tr>
  </table>`;
}

export function detailTable(rows: [string, string][]): string {
  const rowsHtml = rows.map(([label, value]) => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;font-weight:500;padding-right:24px;white-space:nowrap;">${label}</td>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:${DARK};font-weight:500;text-align:right;">${value}</td>
  </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${rowsHtml}</table>`;
}

export function emailList(items: string[]): string {
  return `<ul style="margin:0 0 16px;padding-left:20px;">
    ${items.map((i) => `<li style="font-size:14px;color:#374151;line-height:1.8;">${i}</li>`).join("")}
  </ul>`;
}

export function alertBox(text: string, type: "info" | "warning" | "error" | "success" = "info"): string {
  const colors = {
    info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    error:   { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#14532d" },
  }[type];
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
    <tr>
      <td style="background:${colors.bg};border:1px solid ${colors.border};border-radius:8px;padding:12px 16px;">
        <p style="margin:0;font-size:14px;color:${colors.text};line-height:1.5;">${text}</p>
      </td>
    </tr>
  </table>`;
}

export function emailDivider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">`;
}

export function muted(text: string): string {
  return `<p style="margin:12px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">${text}</p>`;
}
