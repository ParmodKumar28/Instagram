// Sends token directly in JSON response
export const sendToken = async (user, res, statusCode) => {
  const token = user.getJWTToken();
  res.status(statusCode).json({ success: true, user, token });
};

