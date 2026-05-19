async function getAllMessages() {
  try {
    const response = await fetch("http://localhost:3000/messages");

    const data = await response.json();

    const messageContainer = document.getElementById("all-messages");

    messageContainer.textContent = "";

    data.forEach((message) => {
      const newElement = document.createElement("div");

      newElement.textContent = message.sender + ": " + message.text;

      messageContainer.appendChild(newElement);
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

setInterval(getAllMessages, 5000);

const formElement = document.getElementById("chat-form");
const senderElement = document.getElementById("chat-sender");
const messageElement = document.getElementById("chat-message");



formElement.addEventListener("submit", async(event) => {
    event.preventDefault();

    const senderValue = senderElement.value;
    const messageValue = messageElement.value;

    // Send the data
    const response = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sender: senderValue,
            text: messageValue
        })
    });

    if (response.ok) {
        // refresh the list of messages
        getAllMessages();

        // clear the sender and message input values
        senderElement.value = "";
        messageElement.value = "";
        
    }

} )
