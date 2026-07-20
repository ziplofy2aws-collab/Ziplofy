import {
  buildSampleReturnSummaryHtml,
  replaceReturnEmailVariables,
  RETURN_EMAIL_DEFAULTS,
} from './return-summary.shared';

export const RETURN_REQUEST_DECLINED_EMAIL_SUBJECT = 'Your return request was declined';

export function buildReturnRequestDeclinedEmailHtml(variables: Record<string, string>): string {
  const returnSummaryHtml = variables.return_summary_html || buildSampleReturnSummaryHtml();

  return replaceReturnEmailVariables(
    `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Return request declined</title></head>
<body style="margin:0;padding:0;background-color:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f6f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e5e5;">
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #e5e5e5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
            <td style="font-size:20px;font-weight:600;color:#333333;">{{store_name}}</td>
            <td align="right" style="font-size:12px;color:#717171;letter-spacing:0.04em;text-transform:uppercase;">ORDER #{{order_number}}</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;">Your return request was declined</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">We&rsquo;re unable to approve your return request at this time. If you have questions, please contact us and we&rsquo;ll be happy to help.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;"><tr>
            <td style="border-radius:4px;background-color:#1990c6;">
              <a href="{{view_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">View your order</a>
            </td>
          </tr></table>
          <p style="margin:0;font-size:14px;color:#717171;">or <a href="{{store_url}}" style="color:#1990c6;text-decoration:none;">Visit our store</a></p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Return summary</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${returnSummaryHtml}</table>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:14px;color:#717171;line-height:1.6;">If you have any questions, reply to this email or contact us at <a href="mailto:{{support_email}}" style="color:#1990c6;text-decoration:none;">{{support_email}}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    variables,
    RETURN_EMAIL_DEFAULTS
  );
}

export const RETURN_REQUEST_DECLINED_EMAIL_BODY = buildReturnRequestDeclinedEmailHtml({
  store_name: '{{store_name}}',
  order_number: '{{order_number}}',
  view_order_url: '{{view_order_url}}',
  store_url: '{{store_url}}',
  support_email: '{{support_email}}',
});
