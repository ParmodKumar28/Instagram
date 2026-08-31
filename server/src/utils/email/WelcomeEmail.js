// Here, iam creating a welcome email for the user and sending this when new user signup's using nodemailer library
// Imports
import nodemailer from "nodemailer";

export const sendWelcomeMail = async (receiverMail, userName) => {
  try {
    // Creating transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL,
      to: receiverMail,
      subject: "Welcome to Instagram Clone :)",
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Instagram Clone</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fafafa;
        }

        .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            background-color: #ffffff;
        }
    
        img {
            max-width: 100%;
            height: auto;
        }

        h1 {
            color: #333333;
            margin-top: 0;
        }

        p {
            color: #666666;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div>
            <h1>Welcome to Instagram Clone!</h1>
            <p>Dear ${userName},</p>
            <p>Thank you for signing up for Instagram Clone! We're excited to have you as a part of our community.</p>
            <p>With Instagram Clone, you can share your photos and videos, connect with friends, and explore new content.</p>
            <p>If you have any questions or need assistance, feel free to reach out.</p>
            <p>Happy sharing!</p>
            <p>Best regards,<br>Parmod Kumar • Instagram Clone</p>
        </div>
    </div>
</body>
</html>
`,
    };

    // Sending mail
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log();
      } else {
        console.log(`Welcome Email Sent: ${info.response}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
