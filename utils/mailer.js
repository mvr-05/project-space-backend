const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendMail = async (to, subject, text) => {
    await transporter.sendMail({
        from: `"Flutter Verse" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    }).then(() => {
        console.log(`Email sent to ${to} with subject "${subject}"`);
    }).catch((error) => {
        console.error("Error sending email:", error);
    });
};

module.exports = sendMail;
