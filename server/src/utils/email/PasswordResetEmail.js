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
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f7f7f7;
    }

    .container {
        max-width: 560px;
        margin: 40px auto;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    img {
        max-width: 120px;
        height: auto;
        margin-bottom: 20px;
    }

    h1 {
        color: #333333;
        margin-top: 0;
        font-size: 24px;
    }

    p {
        color: #555555;
        line-height: 1.6;
        margin-top: 10px;
    }

    .btn {
        display: block;
        width: 100%;
        padding: 15px 20px;
        background-color: #3498db;
        color: white;
        font-weight: 700;
        text-decoration: none;
        border-radius: 5px;
        text-align: center;
        margin-top: 25px;
    }

    .otp {
        font-weight: 700;
        color: #e74c3c;
        font-size: 20px;
        margin-top: 20px;
    }

    .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eaeaea;
    }

    .footer p {
        color: #999999;
        font-size: 12px;
    }
</style>
</head>
<body>
<div class="container">
    <div style="text-align: center;">
    <img src="https://pbs.twimg.com/profile_images/1526231349354303489/3Bg-2ZsT_400x400.jpg" alt="Instagram" style="width: 150px;">
    </div>
    <h1>Password Reset</h1>
    <p>Dear ${userName},</p>
    <p>We received a request to reset your password for your account. Click the button below to reset your password:</p>
    <a href=${resetPasswordUrl} class="btn">Reset Password</a>
    <h1 class="otp">OTP: ${token}</h1>
    <p>This OTP is only valid for 5 minutes.</p>
    <div class="footer">
        <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
        <p>Thank you,<br>Parmod Yadav Instagram</p>
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
