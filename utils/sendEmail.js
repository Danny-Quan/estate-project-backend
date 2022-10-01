const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: "AparWeb <danielsah@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
