# WhatsApp Clone - High-Level Design (HLD)

## 1. System Overview

### 1.1 Introduction
A real-time web-based messaging application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Socket.IO for real-time communication. The system enables multiple users to communicate instantly with features like message status tracking, online presence, and typing indicators.

### 1.2 Architecture Pattern
**Three-Tier Architecture**
- **Presentation Layer**: React.js frontend
- **Application Layer**: Node.js + Express.js backend
- **Data Layer**: MongoDB database

### 1.3 Communication Pattern
- **REST API**: HTTP requests for CRUD operations
- **WebSocket**: Socket.IO for real-time bidirectional communication

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React.js Frontend                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │NameEntry │  │ChatWindow│  │ChatList  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │UserSearch│  │UserSwitch│  │Components│          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
│               │              │                               │
│         [HTTP/REST]    [WebSocket]                          │
└───────────────┼──────────────┼───────────────────────────────┘
                │              │
                ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Node.js + Express.js Server                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Users   │  │  Chats   │  │Messages  │          │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  │                                                       │   │
│  │         Socket.IO Server (Real-time Engine)          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Event Handlers:                              │   │   │
│  │  │  - userOnline / userOffline                   │   │   │
│  │  │  - sendMessage / receiveMessage               │   │   │
│  │  │  - typing / stopTyping                        │   │   │
│  │  │  - markAsRead / messageStatusUpdate           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                    [MongoDB Driver]                          │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB Database                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Users   │  │  Chats   │  │Messages  │          │   │
│  │  │Collection│  │Collection│  │Collection│          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Component Design

### 3.1 Frontend Components

#### 3.1.1 Core Components
1. **App.js** (Main Container)
   - Manages global state
   - Handles Socket.IO connection
   - Routes between NameEntry and Main Chat

2. **NameEntry.js** (Login Screen)
   - Username input
   - User authentication
   - New user creation

3. **ChatWindow.js** (Message Display)
   - Message rendering
   - Message input
   - Typing indicators
   - Status ticks

4. **ChatList.js** (Conversation List)
   - List of all chats
   - Last message preview
   - Online status indicators

5. **UserSearch.js** (User Discovery)
   - Search functionality
   - User list display
   - Chat initiation

6. **UserSwitcher.js** (Account Management)
   - Multi-user dropdown
   - Account switching
   - Add/logout users

### 3.2 Backend Components

#### 3.2.1 Server Components
1. **server.js** (Main Server)
   - Express app initialization
   - Socket.IO setup
   - MongoDB connection
   - Route mounting

2. **Routes**
   - users.js - User management
   - chats.js - Chat operations
   - messages.js - Message handling

3. **Models**
   - User.js - User schema
   - Chat.js - Chat schema
   - Message.js - Message schema

4. **Socket Event Handlers**
   - Connection management
   - Message broadcasting
   - Status updates
   - Presence tracking

## 4. Data Flow

### 4.1 User Login Flow
```
User → NameEntry → POST /api/users/by-name → MongoDB
                ↓
         User Data Retrieved
                ↓
         Socket.IO Connect
                ↓
         Emit 'userOnline'
                ↓
         Load Chat List
```

### 4.2 Message Send Flow
```
User Types → ChatWindow → socket.emit('sendMessage')
                              ↓
                    Socket.IO Server receives
                              ↓
                    Save to MongoDB (Message)
                              ↓
                    message.populate('sender')
                              ↓
            io.to(chatId).emit('receiveMessage')
                              ↓
                All clients in chat receive
                              ↓
            setTimeout (500ms) → status = 'delivered'
                              ↓
            io.to(chatId).emit('messageStatusUpdate')
```

### 4.3 Message Read Flow
```
User Opens Chat → socket.emit('markAsRead')
                        ↓
              Update Message.readBy[]
                        ↓
              Check if all read → status = 'read'
                        ↓
      io.to(chatId).emit('messageStatusUpdate')
                        ↓
              Sender sees blue ticks
```

## 5. Technology Stack

### 5.1 Frontend
- **Framework**: React.js 18+
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Styling**: CSS3
- **Build Tool**: Create React App

### 5.2 Backend
- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Real-time**: Socket.IO Server
- **Authentication**: JWT (partial)
- **Encryption**: bcryptjs

### 5.3 Database
- **Database**: MongoDB
- **ODM**: Mongoose
- **Connection**: Mongoose Driver

### 5.4 Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv

## 6. API Design

### 6.1 REST Endpoints

#### User APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/by-name | Create or get user by username |
| GET | /api/users | Get all users |
| POST | /api/users/register | Register with email/password |
| POST | /api/users/login | Login with credentials |

#### Chat APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chats | Create or get one-to-one chat |
| GET | /api/chats/:userId | Get all chats for user |
| POST | /api/chats/group | Create group chat |

#### Message APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages/:chatId | Get all messages in chat |
| POST | /api/messages | Send message (backup API) |

### 6.2 Socket Events

#### Client → Server
- `userOnline(userId)` - User connects
- `userOffline(userId)` - User disconnects
- `joinChat({ chatId, userId })` - Join chat room
- `sendMessage({ chatId, senderId, senderName, content })` - Send message
- `markAsRead({ messageId, userId, chatId })` - Mark as read
- `typing({ chatId, userId, username })` - User typing
- `stopTyping({ chatId, userId })` - Stop typing

#### Server → Client
- `receiveMessage(message)` - New message
- `messageStatusUpdate({ messageId, status })` - Status change
- `userStatusChanged({ userId, online })` - Presence update
- `userTyping({ userId, username })` - Typing notification
- `userStoppedTyping({ userId })` - Stop typing notification

## 7. Database Schema

### 7.1 Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique),
  password: String,
  avatar: String,
  online: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Chats Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (ref: User),
  isGroup: Boolean,
  groupName: String,
  lastMessage: ObjectId (ref: Message),
  createdAt: Date,
  updatedAt: Date
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  chat: ObjectId (ref: Chat),
  sender: ObjectId (ref: User),
  content: String,
  messageType: String (enum: text, image, file),
  status: String (enum: sent, delivered, read),
  readBy: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 8. Security Considerations

### 8.1 Current Implementation
- CORS enabled
- Environment variables for sensitive data
- Input sanitization (basic)
- bcrypt password hashing (for password auth)

### 8.2 Recommended Enhancements
- Rate limiting
- JWT token expiration
- SQL injection prevention (using Mongoose)
- XSS protection
- HTTPS enforcement
- End-to-end encryption

## 9. Performance Optimization

### 9.1 Current Optimizations
- Message pagination (load on scroll)
- Socket room-based broadcasting
- Index on frequently queried fields
- Connection pooling

### 9.2 Recommended Improvements
- Redis for caching
- CDN for static assets
- Database query optimization
- Lazy loading images
- Message batching

## 10. Scalability

### 10.1 Horizontal Scaling
- Stateless backend servers
- Socket.IO Redis adapter for multi-server
- Load balancer (Nginx)
- MongoDB replica sets

### 10.2 Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers

## 11. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│            Load Balancer (Nginx)            │
└──────────────┬──────────────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
┌─────────┐         ┌─────────┐
│ Server 1│         │ Server 2│
│ Node.js │         │ Node.js │
│Socket.IO│         │Socket.IO│
└────┬────┘         └────┬────┘
     │                   │
     └─────────┬─────────┘
               │
         ┌─────▼─────┐
         │   Redis   │ (Socket.IO Adapter)
         └───────────┘
               │
         ┌─────▼─────┐
         │  MongoDB  │ (Replica Set)
         │  Primary  │
         └─────┬─────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼────┐
   │Secondary│      │Secondary│
   └────────┘      └────────┘
```

## 12. Monitoring & Logging

### 12.1 Logging
- Console logs for development
- Winston/Morgan for production
- Error tracking (Sentry)

### 12.2 Monitoring
- Server health checks
- Database performance metrics
- Socket connection stats
- API response times

## 13. Error Handling

### 13.1 Frontend
- Try-catch blocks for async operations
- Error state management
- User-friendly error messages
- Retry mechanisms

### 13.2 Backend
- Global error handler
- Validation middleware
- Database error handling
- Socket error handling

## 14. Testing Strategy

### 14.1 Unit Testing
- Component testing (Jest, React Testing Library)
- API endpoint testing (Mocha, Chai)
- Model validation testing

### 14.2 Integration Testing
- API integration tests
- Socket event testing
- Database integration

### 14.3 E2E Testing
- User flow testing (Cypress)
- Multi-user scenarios
- Real-time features testing

## Document Information
**Version**: 1.0  
**Date**: December 17, 2025  
**Status**: Final  
**Author**: Architecture Team
