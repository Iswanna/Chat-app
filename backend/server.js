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

function isValidMessage(req, res) {
  // Check if request body exists at all
  if (!req.body) {
    res.status(400).send("No body provided");
    return false;
  }

  const { text, sender } = req.body;

  // Check if the inputs are strings
  if (typeof text !== "string" || typeof sender !== "string") {
    res.status(400).send("Inputs must be strings");
    return false;
  }

  // Check if the inputs are not a falsy value
  if (!text.trim() || !sender.trim()) {
    res.status(400).send("Please provide both text and a sender name.");
    return false;
  }

  return {
    text: text.trim(),
    sender: sender.trim(),
  };
}

app.post("/messages", (req, res) => {
  const requestBody = isValidMessage(req, res);

  if (!requestBody) {
    return;
  }

  // Create the message object
  const newMessage = {
    id: messages.length,
    sender: requestBody.sender,
    text: requestBody.text,
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

function broadcastCounterUpdate(data) {
  activeConnections.forEach((connection) => {
    // Turn new message object to a string
    const updateMessageString = {
      command: "update-counter",
      payload: data,
    };

    // Send the string message to the connection
    connection.sendUTF(JSON.stringify(updateMessageString));
  });

  while (callBacksForNewMessages.length > 0) {
    const callBack = callBacksForNewMessages.pop();

    callBack([data]);
  }
}

function findMessageOrError(req, res) {
  // Get the id from the URL
  const idFromUrl = req.params.id;

  //convert to number
  const idAsNumber = Number(idFromUrl);

  const messageWithIdAsNumber = messages[idAsNumber];

  if (!messageWithIdAsNumber) {
    res.status(404).send("Message not found");
    return null;
  }

  return messageWithIdAsNumber;
}
app.post("/messages/:id/like", (req, res) => {
  const messageWithIdAsNumber = findMessageOrError(req, res);

  if (!messageWithIdAsNumber) {
    return;
  }
  messageWithIdAsNumber.likes += 1;

  const dataToSendToClient = {
    id: messageWithIdAsNumber.id,
    likes: messageWithIdAsNumber.likes,
    dislikes: messageWithIdAsNumber.dislikes,
  };

  broadcastCounterUpdate(dataToSendToClient);

  res.status(200).send(dataToSendToClient);
});

app.post("/messages/:id/dislike", (req, res) => {
  const messageWithIdAsNumber = findMessageOrError(req, res);

  if (!messageWithIdAsNumber) {
    return;
  }
  messageWithIdAsNumber.dislikes += 1;

  const dataToSendToClient = {
    id: messageWithIdAsNumber.id,
    likes: messageWithIdAsNumber.likes,
    dislikes: messageWithIdAsNumber.dislikes,
  };

  broadcastCounterUpdate(dataToSendToClient);

  res.status(200).send(dataToSendToClient);
});

// Start the server
server.listen(port, () => {
  console.log(`Chat app listening on port ${port}`);
});
