# Hybrid Real-Time Chat API 💬

<p align="left">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

### 🔗 [Live Backend](https://iswanna-chat-app-backend.hosting.codeyourfuture.io/messages) | [Live Frontend (WebSockets)](https://iswanna-chat-app-frontend-websocket.hosting.codeyourfuture.io/) | [ Live Frontend (Long Polling)](https://iswanna-chat-app-frontend-long-polling.hosting.codeyourfuture.io)

## 📌 Project Overview
A sophisticated backend engine that supports real-time communication across multiple client types. This project demonstrates a "Hybrid" approach, ensuring high-speed data delivery via WebSockets while maintaining backward compatibility through HTTP Long Polling.


## 🛠 Technologies Used

### **Backend (Server-Side)**
*   **Node.js**: The runtime environment used to execute JavaScript on the server.
*   **Express.js**: The web framework used to build the RESTful API and manage middleware.
*   **WebSockets (ws/wss)**: Used to establish a persistent, bidirectional communication pipe for real-time updates.
*   **CORS**: Middleware used to allow secure cross-origin communication between the frontend and backend.

### **Frontend (Client-Side)**
*   **Vanilla JavaScript (ES6+)**: Used for DOM manipulation, event handling, and managing the WebSocket lifecycle.
*   **HTML5 & CSS3**: Used to structure and style the chat interface.
*   **Fetch API**: Used for standard HTTP POST requests to send messages and reactions.

### **Tools & Dev Ops**
*   **NPM**: Used for package management.
*   **JSON**: The data format used for the custom "Command Pattern" protocol.
*   **Git/GitHub**: Version control and documentation.

## ✨ Key Features
- **Dual-Mode Broadcasting:** Engineered a server that simultaneously pushes updates to WebSocket "pipes" and handles "waiting" Long Polling requests.
- **State Reconciliation (Catch-up):** Implemented logic using `?since=` query parameters to automatically synchronize chat history for users who connect late or experience network flickers.
- **Live Reactions:** Real-time Like and Dislike functionality with an "Absolute Total" update strategy to ensure UI consistency across all connected sessions.
- **Command Pattern Protocol:** Designed a structured message format (`command` and `payload`) to allow the frontend to distinguish between new messages and reaction updates over a single stream.

## ⚙️ Engineering Wins
- **Custom Middleware Pipeline:** Developed modular middlewares for header extraction (`X-Username`) and manual JSON array validation, including robust `try/catch` error handling to prevent server crashes.
- **DRY Refactoring:** Optimized the codebase by extracting common functionality into centralized helper functions for message retrieval, input sanitization (trimming), and multi-protocol broadcasting.
- **Reliability:** Built-in "Early Return" guard clauses and 404/400 error handling ensure the API is robust against malformed data.


## 🚀 Getting Started

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Iswanna/Module-Decomposition.git
   ```
2. **Navigate into the project folder:**
   ```bash
   cd chat-app
   ```
3. **Switch to the branch with my work:**
   ```bash
   git checkout feature/chat-app
   ```
4. **Install the dependencies:**
   ```bash
   cd backend
   npm install
   ```
5. **Start the server:**
   ```bash
   node server.js
   ```
6. **Open the App:**
   Open `index.html` (for long-polling) or `index-websocket.html` (for WebSockets) in your browser.

