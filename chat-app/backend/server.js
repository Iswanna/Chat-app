import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const messages = [];
const callBacksForNewMessages = [];

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

  // long polling logic
  while (callBacksForNewMessages.length > 0) {
    // take the last function out the array
    const callback = callBacksForNewMessages.pop();

    // run that function using the newMessage as argument
    callback([newMessage]);
  }

  // Finally, respond to the person who actually sent the POST request
  res.status(201).send(newMessage);
});
app.get("/messages", (req, res) => {
  const sinceValue = req.query.since;

  let sinceId;
  // We check if the value exists at all.
  // If it's "0", this check is true, and we use 0.
  if (sinceValue !== undefined) {
    sinceId = Number(sinceValue);
  } else {
    sinceId = -1;
  }

  const messagesSinceId = messages.filter((message) => message.id > sinceId);

  if (messagesSinceId.length === 0) {
    callBacksForNewMessages.push((value) => res.send(value));
  } else {
    res.send(messagesSinceId);
  }
});

app.post("/messages/:id/like", (req, res) => {
  // Get the id from the URL
  const idFromUrl = req.params.id;

  //convert to number
  const idAsNumber = Number(idFromUrl);

  const messageWithIdAsNumber = messages.find(
    (message) => message.id === idAsNumber,
  );

  messageWithIdAsNumber.likes += 1;
});

// Start the server
app.listen(port, () => {
  console.log(`Chat app listening on port ${port}`);
});
