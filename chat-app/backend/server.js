import express from "express";
import cors from "cors";
import { server as WebSocketServer } from "websocket";
import http from "http";

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ httpServer: server });

const port = process.env.PORT || 3000;

const messages = [];
const callBacksForNewMessages = [];
let activeConnections = [];

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request body
app.use(express.json());

webSocketServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);

  activeConnections.push(connection);

  console.log("A user connected");

  const sinceId = Number(request.resourceURL.query.since);

  if (!isNaN(sinceId)) {
    const messagesSineId = messages.filter((message) => message.id > sinceId);

    messagesSineId.forEach((message) => {
      const messageSinceIdObject = {
        command: "new-message",
        payload: message,
      };
      connection.sendUTF(JSON.stringify(messageSinceIdObject));
    });
  }

  connection.on("close", () => {
    activeConnections = activeConnections.filter(
      (connectionToRemove) => connection !== connectionToRemove,
    );
  });
});

app.post("/messages", (req, res) => {
  // Check if re.body exists at all
  if (!req.body) {
    return res.status(400).send("No body provided");
  }

  const { text, sender } = req.body;

  // Check if the inputs are strings
  if (typeof text !== "string" || typeof sender !== "string") {
    return res.status(400).send("Inputs must be strings");
  }

  // Check if the inputs are not a falsy value
  if (!text.trim() || !sender.trim()) {
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

  // Websocket Broadcast
  activeConnections.forEach((connection) => {
    // Turn new message object to a string
    const newMessageString = {
      command: "new-message",
      payload: newMessage,
    };

    // Send the string message to the connection
    connection.sendUTF(JSON.stringify(newMessageString));
  });

  // long polling Broadcast
  while (callBacksForNewMessages.length > 0) {
    const callBack = callBacksForNewMessages.pop();

    callBack([newMessage]);
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

  const messageWithIdAsNumber = messages[idAsNumber];

  if (!messageWithIdAsNumber) {
    return res.status(404).send("Message not found");
  }
  messageWithIdAsNumber.likes += 1;

  const dataToSendToClient = {
    id: messageWithIdAsNumber.id,
    likes: messageWithIdAsNumber.likes,
    dislikes: messageWithIdAsNumber.dislikes,
  };

  activeConnections.forEach((connection) => {
    // Turn new message object to a string
    const updateMessageString = {
      command: "update-counter",
      payload: dataToSendToClient,
    };

    // Send the string message to the connection
    connection.sendUTF(JSON.stringify(updateMessageString));
  });

  while (callBacksForNewMessages.length > 0) {
    const callBack = callBacksForNewMessages.pop();

    callBack([dataToSendToClient]);
  }
  res.status(200).send(dataToSendToClient);
});

app.post("/messages/:id/dislike", (req, res) => {
  // Get the id from the URL
  const idFromUrl = req.params.id;

  //convert to number
  const idAsNumber = Number(idFromUrl);

  const messageWithIdAsNumber = messages[idAsNumber];

  if (!messageWithIdAsNumber) {
    return res.status(404).send("Message not found");
  }
  messageWithIdAsNumber.dislikes += 1;

  const dataToSendToClient = {
    id: messageWithIdAsNumber.id,
    likes: messageWithIdAsNumber.likes,
    dislikes: messageWithIdAsNumber.dislikes,
  };

  activeConnections.forEach((connection) => {
    // Turn new message object to a string
    const updateMessageString = {
      command: "update-counter",
      payload: dataToSendToClient,
    };

    // Send the string message to the connection
    connection.sendUTF(JSON.stringify(updateMessageString));
  });

  while (callBacksForNewMessages.length > 0) {
    const callBack = callBacksForNewMessages.pop();

    callBack([dataToSendToClient]);
  }
  res.status(200).send(dataToSendToClient);
});

// Start the server
server.listen(port, () => {
  console.log(`Chat app listening on port ${port}`);
});
