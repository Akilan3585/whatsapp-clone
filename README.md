# WhatsApp-like Chat Application

A minimal WhatsApp-like chat application built with MERN stack (MongoDB, Express, React, Node.js) featuring real-time messaging using Socket.io.

## Features

- User registration and authentication
- Real-time messaging with WebSocket connections
- Persistent message storage in MongoDB Atlas
- WhatsApp-inspired UI theme
- Chat list and individual chat windows

## Backend Setup

1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB Atlas:
   - Create a MongoDB Atlas account and cluster
   - Get your connection string
   - Update `.env` file with your MongoDB URI and JWT secret

4. Start the backend server:
   ```
   npm start
   ```

## Frontend Setup

1. Navigate to the Frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

## Usage

1. Open the application in your browser (http://localhost:3000)
2. Register two users in different browser tabs/windows
3. Create a chat between the users
4. Start sending real-time messages

## API Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/chats/:userId` - Get chats for a user
- `POST /api/chats` - Create a new chat
- `GET /api/messages/:chatId` - Get messages for a chat

## Real-time Events

- `joinChat` - Join a chat room
- `sendMessage` - Send a message
- `receiveMessage` - Receive a message

## Technologies Used

- **Backend**: Node.js, Express.js, Socket.io, MongoDB, Mongoose
- **Frontend**: React, Socket.io-client, Axios
- **Database**: MongoDB Atlas
- **Authentication**: JWT