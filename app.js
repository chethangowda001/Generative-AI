const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config();
const port = process.env.PORT || 3000;



const app = express();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Route to render the home view
app.get("/home", (req, res) => {
  res.render("home", { generativeText: null }); // Initialize without generated text
});

// API route to generate content based on the prompt using GET method and query
app.get("/api/prompt", async (req, res) => {
  try {
    const { prompt } = req.query; // Extract prompt from query parameters
    console.log("Received Prompt:", prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Call the AI model to generate content
    const result = await model.generateContent(prompt);
    console.log("Full Result from AI:", JSON.stringify(result, null, 2)); // Log the entire result for debugging

    // Safely access the generated text from the response
    const responseText = result?.response?.text() || "No response text found";

    // Render the home page with the generated text
    res.render("home", { generativeText: responseText });
  } catch (error) {
    console.error("Error generating content:", error.message); // Log only the error message for clarity
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server connected to port ${port}`);
});
