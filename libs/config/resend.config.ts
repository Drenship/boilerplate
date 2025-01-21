import { Resend } from "resend";
import { bufferInvoice } from "@/components/DocumentsPDF/Receipts/Invoice-v1";
import SendCodeEmail from "@/emails/auth/send-code";
import ReceiptEmail from "@/emails/receipts/receipt-order";
import EmailVerification from "@/emails/auth/verify-email";
import WelcomeEmail from "@/emails/others/welcome";

export const resend = new Resend(process.env.RESEND_API as string);
const defaultSenderEmail = "onboarding@resend.dev"

interface resendEmailProps {
  from?: string;
  to: string;
  subject: string;
  code?: string;
  order?: any;
}

export const sendWelcomeEmail = async ({
  from,
  to,
  subject,
  userName,
  dashboardUrl,
}: {
  from?: string;
  to: string;
  subject: string;
  userName: string;
  dashboardUrl: string;
}) => {
  try {
    return await resend.emails.send({
      from: from ? from : defaultSenderEmail,
      to: to,
      subject: subject,
      react: WelcomeEmail({
        userName: userName,
        dashboardUrl: dashboardUrl,
      }),
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

export const sendEmailVerification = async ({
  from,
  to,
  subject,
  verificationLink,
}: {
  from?: string;
  to: string;
  subject: string;
  verificationLink: string;
}) => {
  try {
    return await resend.emails.send({
      from: from ? from : defaultSenderEmail,
      to: to,
      subject: subject,
      react: EmailVerification({
        title: "Verify Your Email Address",
        verificationLink: verificationLink,
      }),
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const resetPasswordEmail = async ({
  from,
  to,
  subject,
  code,
}: resendEmailProps) => {
  try {
    return await resend.emails.send({
      from: from ? from : defaultSenderEmail,
      to: to,
      subject: subject,
      react: SendCodeEmail({
        validationCode: code,
      }),
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendReceiptEmail = async ({
  from,
  to,
  subject,
  order,
}: resendEmailProps) => {
  try {
    // call le buffer PDF
    const pdfBuffer = await bufferInvoice(order);

    return await resend.emails.send({
      from: from ? from : defaultSenderEmail,
      to: to,
      subject: subject,
      react: ReceiptEmail({ email: to, order }),
      attachments: [
        {
          filename: `${order.invoiceId}.pdf`,
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
