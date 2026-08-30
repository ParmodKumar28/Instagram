import rateLimit from "express-rate-limit";

/**
 * Rate Limiter for Authentication & Password Endpoints
 * (Sign up, Sign in, Forgot Password, Reset Password)
 * Max 100 attempts per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    msg: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Rate Limiter for User Content Creation & Social Actions
 * (Creating posts, comments, stories, messages)
 * Prevents spam bots while giving active users ample headroom.
 * Max 300 creation requests per 15 minutes per IP.
 */
export const contentCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    msg: "You are creating content too quickly. Please wait a moment before trying again.",
  },
});

/**
 * General Global API Limiter
 * Generous baseline protection against aggressive scraping and DoS.
 * Max 3000 requests per 15 minutes per IP (~200 req/min).
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Limit each IP to 3000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many requests from this IP. Please try again later.",
  },
});
