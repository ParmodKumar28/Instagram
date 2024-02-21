// Here, iam importing server from index.js and listening here.
// Imports
import app from "./src/app.js";
import connectToDB from "./src/config/db.js";

// Listening to server
const PORT = process.env.PORT;
app.listen(PORT, async (error) => {
  if (error) {
    console.log(`Error occurred while listening to server: ${error}`);
  } else {
    // Connecting to database
    await connectToDB();
    console.log(`Server is listening on http://localhost:${PORT}`);
  }
});
