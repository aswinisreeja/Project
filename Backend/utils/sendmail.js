const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, attachmentPath) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nodemailerforlearningg@gmail.com',
        pass: 'yleq xrbn akuk erte',
    },
  });

  let mailOptions = {
    from: 'nodemailerforlearningg@gmail.com',
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'summary.pdf',
        path: attachmentPath,
      },
    ],
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
}

module.exports = sendEmail;
