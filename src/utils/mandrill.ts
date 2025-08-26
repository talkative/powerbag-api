const nodemailer = require('nodemailer');
const mandrillTransport = require('nodemailer-mandrill-transport');

const smtpTransport = nodemailer.createTransport(
  mandrillTransport({
    auth: {
      apiKey: process.env.MANDRILL_KEY || '',
    },
  })
);

export function sendEmail({
  to,
  subject,
  text,
  merge_vars,
  template_name,
}: {
  to: string;
  subject: string;
  text?: string;
  merge_vars?: any[];
  template_name?: string;
}) {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail(
      {
        from: 'Powerbag <info@talkative.se>',
        to: to,
        replyTo: 'info@talkative.se',
        text: text ?? '',
        subject,
        mandrillOptions: {
          message: {
            global_merge_vars: merge_vars || [],
          },
          merge: true,
          merge_language: 'mailchimp',
          template_name: template_name || '',
          template_content: [],
        },
      },
      (error: Error | null, response: any) => {
        if (error) {
          console.error(error);
          reject(new Error('Error in sending email'));
          return;
        }

        console.log('response', response);
        resolve(response);
      }
    );
  });
}
