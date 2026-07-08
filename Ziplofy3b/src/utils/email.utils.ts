import transporter from "../config/nodemailer.config";

export enum UrlType {
  VIEW_REQUIREMENTS_FORM = "viewRequirementsForm",
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  url?: string;
  urlType?: UrlType;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const from = process.env.EMAIL_ADDRESS?.trim();
  if (!from) {
    throw new Error('EMAIL_ADDRESS is not configured. Check your .env file.');
  }

  let emailBody = options.body;

  if (options.url) {
    // Add the URL to the body, with a clickable link
    emailBody += `<br/><br/>Link: <a href="${options.url}" target="_blank">${options.url}</a>`;
  }

  const mailOptions = {
    from: `codiic <${from}>`,
    to: options.to,
    subject: options.subject,
    html: emailBody,
  };

  await transporter.sendMail(mailOptions);
};