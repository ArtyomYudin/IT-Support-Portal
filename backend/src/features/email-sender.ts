import nodemailer from 'nodemailer';

export async function sendEmailNotification(msg: any) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.center-inform.ru',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASSWORD,
    },
  });

  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Портал ИТО" <itsupport@center-inform.ru>',
      to: 'a.yudin@center-inform.ru',
      subject: `${msg.subject}`,
      text: `${msg.text}`,
      html: `${msg.textAsHTML}`,
    });

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.log(error);
  }
}
