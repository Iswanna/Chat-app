const API_URL = "iswanna-chat-app-backend.hosting.codeyourfuture.io";
const API_BASE_URL = `https://${API_URL}`;

// const API_URL = "localhost:3000";
// const API_BASE_URL = `http://${API_URL}`;

let lastIdSeen = -1;

const wsUri = `wss://${API_URL}/messages?since=${lastIdSeen}`;
// const wsUri = `ws://${API_URL}/messages?since=${lastIdSeen}`

const webSocket = new WebSocket(wsUri);

webSocket.addEventListener("open", (event) => {
  webSocket.send("Hello Server!");
});

webSocket.addEventListener("message", (event) => {
  const receivedMessage = JSON.parse(event.data);

  const command = receivedMessage.command;

  if (command === "new-message" || command === "update-counter") {
    renderMessages([receivedMessage.payload]);
  }
});

function renderMessages(messages) {
  const messageContainer = document.getElementById("all-messages");

  messages.forEach((message) => {
    const elementId = "msg-" + message.id;

    const existingElement = document.getElementById(elementId);

    if (existingElement) {
      // find the specific span that hold the likes
      const likeSpan = document.getElementById("likes-count-" + message.id);
      const dislikeSpan = document.getElementById(
        "dislikes-count-" + message.id,
      );

      // update only that span
      if (likeSpan) {
        likeSpan.textContent = `(${message.likes} Likes) `;
      }

      if (dislikeSpan) {
        dislikeSpan.textContent = `(${message.dislikes} Dislikes) `;
      }
    } else {
      const newElement = document.createElement("div");
      newElement.id = "msg-" + message.id;

      // layer 1: the text
      const textSpan = document.createElement("span");
      textSpan.textContent = `${message.sender}: ${message.text} `;

      //Layer 2: the counter (this is the one we will update later)
      const likeSpan = document.createElement("span");
      likeSpan.id = "likes-count-" + message.id;
      likeSpan.textContent = `(${message.likes} Likes) `;

      //Layer 2a: the counter (this is the one we will update later)
      const disLikeSpan = document.createElement("span");
      disLikeSpan.id = "dislikes-count-" + message.id;
      disLikeSpan.textContent = `(${message.dislikes} Dislikes) `;

      // Layer 3: the like button
      const likeButton = document.createElement("button");
      likeButton.textContent = "Like";

      likeButton.addEventListener("click", async () => {
        await fetch(`${API_BASE_URL}/messages/${message.id}/like`, {
          method: "POST",
        });
      });

      // Layer 3: the dislike button
      const disLikeButton = document.createElement("button");
      disLikeButton.textContent = "Dislike";

      disLikeButton.addEventListener("click", async () => {
        await fetch(`${API_BASE_URL}/messages/${message.id}/dislike`, {
          method: "POST",
        });
      });

      // put it all together
      newElement.appendChild(textSpan);
      newElement.appendChild(likeSpan);
      newElement.appendChild(likeButton);
      newElement.appendChild(disLikeSpan);
      newElement.appendChild(disLikeButton);
      messageContainer.appendChild(newElement);

      lastIdSeen = message.id;
    }
  });
}

const formElement = document.getElementById("chat-form");
const senderElement = document.getElementById("chat-sender");
const messageElement = document.getElementById("chat-message");

formElement.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get the values and trim them
  const senderValue = senderElement.value.trim();
  const messageValue = messageElement.value.trim();

  // The validation
  if (senderValue === "" || messageValue === "") {
    alert("Please enter both a name and a message!");

    return;
  }

  try {
    // Send the data
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: senderValue,
        text: messageValue,
      }),
    });

    if (response.ok) {
      // clear the sender and message input values
      senderElement.value = "";
      messageElement.value = "";
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
});
