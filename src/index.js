// Here, iam creating the server using Express and routing and all
// Dotenv config at the top here
import "./dotenv.js";

// Imports
import express from "express";


// Server
const app = express();

// Default route
app.get('/', (req, res, next) => {
    res.send("Welcome To Instagram");
})

// Routes

// Exporting server
export default app;



