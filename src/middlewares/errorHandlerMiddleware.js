// Creating middleware for handling errors here.
export const errorHandlerMiddleware = (err, req, res, next) => {
  // Log the error here first for better approach
  console.log(err);
  err.message = err.message || "Internal server error!";
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};

// Handling handlingUncaughtError Rejection
export const handleUncaughtError = () => {
  process.on("uncaughtException", (err) => {
    console.log(`Error: ${err}`);
    console.log("Shutting down the server bcz of uncaughtException");
  });
};
