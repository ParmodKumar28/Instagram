// Here, iam importing server from index.js and listening here.
// Imports
import app from "./index.js";
import connectToDB from "./config/db.js";

// Listening to server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  // Connecting to database
  connectToDB();
});

app.on("error", (error) => {
  console.log(`Error occurred while listening to server: ${error}`);
});
