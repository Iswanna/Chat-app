import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const messages = [];

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request body
app.use(express.json());

app.post("/messages", (req, res) => {
  const { text, sender } = req.body;

  // The validation
  if (!text || text.length === 0 || !sender || sender.length === 0) {
    return res.status(400).send("Please provide both text and a sender name.");
  }

  // Create the message object
  const newMessage = {
    id: messages.length,
    sender: sender,
    text: text,
    likes: 0,
    dislikes: 0,
  };

  // Add the new message to the messages array (the storage)
  messages.push(newMessage);

  // Send back a success status and the message (the response)
  res.status(201).send(newMessage);
});
app.get("/messages", (req, res) => {
  res.send(messages);
});

// Start the server
app.listen(port, () => {
  console.log(`Chat app listening on port ${port}`);
});
