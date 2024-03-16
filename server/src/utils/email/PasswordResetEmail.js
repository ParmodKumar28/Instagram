// Here, iam creating a password reset email for the user and sending this when new user click forget password using nodemailer library
// Imports
import nodemailer from "nodemailer";

export const sendResetPasswordMail = async (
  receiverMail,
  userName,
  token,
  resetPasswordUrl
) => {
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
      subject: "OTP for password reset!",
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
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

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center; padding-bottom: 20px;">
            <img src="https://pbs.twimg.com/profile_images/1526231349354303489/3Bg-2ZsT_400x400.jpg" alt="Instagram" style="width: 150px;">
        </div>
        <div>
            <h1>Password Reset</h1>
            <p>Dear ${userName},</p>
            <p>We received a request to reset your password for your Instagram account. Click the button below to reset your password:</p>
            <p><a href=${resetPasswordUrl} class="btn">Reset Password</a> Otp: ${token}</p>
            <p>This otp is only valid till 5 minutes</p>
            <p>If you did not request a password reset, you can ignore this email. Your password will not be changed.</p>
            <p>Thank you,<br>The Instagram Team</p>
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
