let lastIdSeen = -1;

async function getAllMessages() {
  try {
    const response = await fetch(
      `https://iswanna-chat-app-backend.hosting.codeyourfuture.io//messages?since=${lastIdSeen}`,
    );

    const data = await response.json();

    const messageContainer = document.getElementById("all-messages");

    data.forEach((message) => {
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
          await fetch(
            `https://iswanna-chat-app-backend.hosting.codeyourfuture.io//messages/${message.id}/like`,
            {
              method: "POST",
            },
          );
        });

        // put it all together
        newElement.appendChild(textSpan);
        newElement.appendChild(likeSpan);
        newElement.appendChild(likeButton);
        messageContainer.appendChild(newElement);

        lastIdSeen = message.id;
      }
    });
    setTimeout(getAllMessages, 0);
  } catch (error) {
    setTimeout(getAllMessages, 0);
    console.error("Error fetching messages:", error);
  }
}

getAllMessages();

const formElement = document.getElementById("chat-form");
const senderElement = document.getElementById("chat-sender");
const messageElement = document.getElementById("chat-message");

formElement.addEventListener("submit", async (event) => {
  event.preventDefault();

  const senderValue = senderElement.value;
  const messageValue = messageElement.value;

  try {
    // Send the data
    const response = await fetch(
      "https://iswanna-chat-app-backend.hosting.codeyourfuture.io//messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: senderValue,
          text: messageValue,
        }),
      },
    );

    if (response.ok) {
      // clear the sender and message input values
      senderElement.value = "";
      messageElement.value = "";
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
});
