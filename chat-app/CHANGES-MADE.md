## Changes Made

### Backend Implementation (`backend/`)

#### `server.js` (New)

- Set up Express server with CORS middleware
- Implemented **POST `/messages`** endpoint with input validation
  - Validates sender name and message text
  - Creates message objects with id, sender, text, likes, and dislikes
  - Returns 201 status on success, 400 on validation error
  - Triggers long polling callbacks to notify waiting clients
- Implemented **GET `/messages`** endpoint with long polling
  - Accepts `?since=` query parameter for incremental message loading
  - Returns only messages with id > sinceId
  - Holds client requests until new messages arrive (long polling)
  - Handles edge case where since=0 correctly
- Implemented **POST `/messages/:id/like`** endpoint
  - Increments like count for specified message
  - Notifies all waiting clients via long polling
  - Returns 200 on success, 404 if message not found

#### `package.json` (New)

- Configured as ES module project (`"type": "module"`)
- Added Express 5.2.1 dependency
- Added CORS 2.8.6 dependency

### Frontend Implementation (`frontend/`)

#### `index.html` (New)

- Semantic HTML structure with proper meta tags
- Chat form with sender name and message inputs
- Message container div for displaying chat history
- Deferred JavaScript execution for proper DOM loading

#### `script.js` (New)

- **`getAllMessages()`** async function
  - Fetches messages from backend with `?since=` parameter
  - Implements incremental message loading via `lastIdSeen` tracking
  - Updates existing message likes without re-rendering
  - Creates DOM elements for new messages with text, like count, and like button
  - Uses long polling with `setTimeout(getAllMessages, 0)` for real-time updates
  - Includes error handling with automatic retry on fetch failure

- **Form submission handler**
  - Validates sender name and message text
  - Sends POST request with JSON payload
  - Clears input fields after successful submission
  - Includes try-catch error handling

- **Like button functionality**
  - Sends POST request to `/messages/:id/like` endpoint
  - Extracts current like count from DOM
  - Provides immediate UI feedback (optimistic update)
  - Updates display instantly without waiting for server response

#### `styles.css` (New)

- Styled message containers with border, padding, and rounded corners
- Light gray background (#f9f9f9) for message boxes
- Styled like buttons with blue background (#007bff) and white text
- Proper spacing and cursor pointer for better UX

## Testing Instructions

### Setup

```bash
# Install backend dependencies
cd backend
npm install

# Start backend server
node server.js

```
