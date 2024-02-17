// Here createing token and saving into the cookies
export const sendToken = async (user, res, statusCode) => {
  // Creating token here from calling getJWTToken from userSchema
  const token = user.getJWTToken();
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Sending response and setting token to cookie
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ success: true, user, token });
};
