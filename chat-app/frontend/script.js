const API_BASE_URL = "https://iswanna-chat-app-backend.hosting.codeyourfuture.io";
//const API_BASE_URL = "http://localhost:3000";

let lastIdSeen = -1;

async function getAllMessages() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messages?since=${lastIdSeen}`,
    );

    // check if the response is not ok
    if (!response.ok) {
      // Stop everything and jump to the catch block
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // we only get here if the response was ok
    const data = await response.json();

    renderMessages(data);
  } catch (error) {
    console.error("Error fetching messages:", error);
  } finally {
    setTimeout(getAllMessages, 0);
  }
}

function renderMessages(messages) {
  const messageContainer = document.getElementById("all-messages");

  messages.forEach((message) => {
    const elementId = "msg-" + message.id;

    const existingElement = document.getElementById(elementId);

    if (existingElement) {
      // find the specific span that hold the likes
      const likeSpan = document.getElementById("likes-count-" + message.id);

      // update only that span
      if (likeSpan) {
        likeSpan.textContent = `(${message.likes} Likes) `;
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

      // Layer 3: the button
      const likeButton = document.createElement("button");
      likeButton.textContent = "Like";

      likeButton.addEventListener("click", async () => {
        await fetch(`${API_BASE_URL}/messages/${message.id}/like`, {
          method: "POST",
        });
      });

      // put it all together
      newElement.appendChild(textSpan);
      newElement.appendChild(likeSpan);
      newElement.appendChild(likeButton);
      messageContainer.appendChild(newElement);

      lastIdSeen = message.id;
    }
  });
}

getAllMessages();

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
