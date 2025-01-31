const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Initialize Express
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Make sure 'index.html' is in the same directory as 'RAG.js'
});

// Load your structured data
const structuredData = JSON.parse(fs.readFileSync('structured_website_data.json', 'utf8'));

// Function to retrieve relevant context from structured data
function getRelevantContext(question) {
    const context = [];
    for (const section of ["headlines", "descriptions", "services", "testimonials"]) {
        structuredData[section].forEach((item) => {
            if (item.toLowerCase().includes(question.toLowerCase())) {
                context.push(item);
            }
        });
    }
    return [...new Set(context)].join("\n");
}

// Route to handle POST request for chatbot response
app.post('/get-bot-response', async (req, res) => {
    const { question } = req.body;
    const context = getRelevantContext(question);

    if (!context) {
        return res.json({ answer: "I'm sorry, but I couldn't find relevant information." });
    }

    const prompt = `### Given the following context, provide a **clear, structured, and concise** answer to the question.\n\n**Context:**\n${context}\n\n**Question:** ${question}\n\n**Answer:**`;

    try {
        const response = await axios.post("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent", {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        }, {
            params: { key: "AIzaSyBeqI5kGtW3reQvGn_HW4i6onxk5JIV82E" }
        });

        if (response.data?.candidates?.length > 0) {
            const answer = response.data.candidates[0]?.content?.parts[0]?.text || "No response generated.";
            return res.json({ answer });
        } else {
            return res.json({ answer: "Error: No valid response received from Gemini." });
        }
    } catch (error) {
        console.error("Error interacting with Gemini API:", error.message);
        return res.json({ answer: "Error processing the request." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
