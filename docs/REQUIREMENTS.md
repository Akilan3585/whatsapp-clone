# WhatsApp Clone - System Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for a real-time chat application inspired by WhatsApp, built using the MERN (MongoDB, Express.js, React, Node.js) stack.

### 1.2 Scope
The application enables multiple users to communicate in real-time through text messages with features like message status tracking, online presence, and typing indicators.

### 1.3 Intended Audience
- Developers
- Project Managers
- QA Engineers
- Stakeholders

## 2. Overall Description

### 2.1 Product Perspective
A web-based real-time messaging application that allows users to:
- Login with simple username
- Search and find other users
- Send and receive instant messages
- Track message delivery and read status
- See online/offline status of users
- View typing indicators

### 2.2 User Classes
- **End Users**: Individuals who use the application for messaging
- **System Administrator**: Manages backend infrastructure and database

### 2.3 Operating Environment
- **Frontend**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Backend**: Node.js runtime environment
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO

## 3. Functional Requirements

### 3.1 User Authentication
- **FR-1.1**: System shall allow users to login with a username
- **FR-1.2**: System shall create new user if username doesn't exist
- **FR-1.3**: System shall support multiple users logging in with different names on same URL
- **FR-1.4**: System shall maintain user sessions

### 3.2 User Management
- **FR-2.1**: System shall display list of all registered users
- **FR-2.2**: System shall allow users to search for other users by username
- **FR-2.3**: System shall show online/offline status of users
- **FR-2.4**: System shall update user presence in real-time
- **FR-2.5**: System shall allow users to switch between multiple logged-in accounts

### 3.3 Messaging
- **FR-3.1**: System shall allow users to send text messages
- **FR-3.2**: System shall deliver messages in real-time
- **FR-3.3**: System shall store messages persistently in database
- **FR-3.4**: System shall display message timestamps
- **FR-3.5**: System shall show sender name for received messages
- **FR-3.6**: System shall support one-to-one conversations

### 3.4 Message Status
- **FR-4.1**: System shall show single grey tick (✓) when message is sent
- **FR-4.2**: System shall show double grey ticks (✓✓) when message is delivered
- **FR-4.3**: System shall show double blue ticks (✓✓) when message is read
- **FR-4.4**: System shall auto-update message status from sent to delivered after 500ms
- **FR-4.5**: System shall mark messages as read when recipient opens the chat

### 3.5 Real-time Features
- **FR-5.1**: System shall display typing indicator when user is typing
- **FR-5.2**: System shall hide typing indicator after 2 seconds of inactivity
- **FR-5.3**: System shall broadcast user online/offline events
- **FR-5.4**: System shall update message status in real-time

### 3.6 Chat Management
- **FR-6.1**: System shall create or retrieve existing chat between two users
- **FR-6.2**: System shall prevent duplicate chat creation
- **FR-6.3**: System shall display chat list with most recent conversations first
- **FR-6.4**: System shall load message history when chat is opened

### 3.7 User Interface
- **FR-7.1**: System shall display user's messages on right side with green background
- **FR-7.2**: System shall display received messages on left side with white background
- **FR-7.3**: System shall show chat header with participant name and status
- **FR-7.4**: System shall provide search box for finding users
- **FR-7.5**: System shall show user avatars with initials

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-1.1**: Messages shall be delivered within 100ms
- **NFR-1.2**: System shall support at least 100 concurrent users
- **NFR-1.3**: Page load time shall be less than 2 seconds
- **NFR-1.4**: Message status updates shall occur within 500ms

### 4.2 Reliability
- **NFR-2.1**: System uptime shall be 99% or higher
- **NFR-2.2**: System shall handle connection drops gracefully
- **NFR-2.3**: Messages shall be persisted before acknowledgment

### 4.3 Scalability
- **NFR-3.1**: System shall support horizontal scaling
- **NFR-3.2**: Database shall handle growing message volumes efficiently

### 4.4 Security
- **NFR-4.1**: System shall use CORS protection
- **NFR-4.2**: System shall sanitize user inputs
- **NFR-4.3**: Environment variables shall be used for sensitive data

### 4.5 Usability
- **NFR-5.1**: Interface shall be intuitive and similar to WhatsApp
- **NFR-5.2**: System shall provide visual feedback for all actions
- **NFR-5.3**: Error messages shall be clear and actionable

### 4.6 Maintainability
- **NFR-6.1**: Code shall follow industry best practices
- **NFR-6.2**: System shall have modular architecture
- **NFR-6.3**: API endpoints shall be RESTful

### 4.7 Portability
- **NFR-7.1**: Application shall work on all modern browsers
- **NFR-7.2**: UI shall be responsive for different screen sizes

## 5. System Features

### 5.1 Login Screen
- Username input field
- Login button
- Instructions for multi-user testing
- Automatic user creation

### 5.2 Main Chat Interface
- Sidebar with:
  - User switcher dropdown
  - User search box
  - Chat list
- Main chat window with:
  - Chat header (name, status)
  - Message area
  - Message input box
  - Send button

### 5.3 Message Display
- Message bubbles
- Timestamps
- Status ticks (for own messages)
- Sender names (for received messages)
- Typing indicators

## 6. External Interface Requirements

### 6.1 User Interfaces
- Web-based responsive interface
- WhatsApp-inspired design
- Color scheme: Green (#25d366), White, Grey

### 6.2 Hardware Interfaces
- Standard computer/laptop with web browser
- Network connection required

### 6.3 Software Interfaces
- **Frontend**: React.js 18+
- **Backend**: Node.js 14+, Express.js
- **Database**: MongoDB 4.4+
- **Real-time**: Socket.IO 4+
- **HTTP Client**: Axios

### 6.4 Communication Interfaces
- HTTP/HTTPS for REST API
- WebSocket for real-time communication
- JSON data format

## 7. Database Requirements

### 7.1 Collections
1. **Users**
   - _id, username, email, password, avatar, online, lastSeen, timestamps

2. **Chats**
   - _id, participants[], isGroup, groupName, lastMessage, timestamps

3. **Messages**
   - _id, chat, sender, content, messageType, status, readBy[], timestamps

## 8. API Endpoints

### 8.1 User APIs
- POST /api/users/by-name - Create/get user by username
- GET /api/users - Get all users
- POST /api/users/register - Register with password
- POST /api/users/login - Login with credentials

### 8.2 Chat APIs
- POST /api/chats - Create new chat
- GET /api/chats/:userId - Get user's chats
- POST /api/chats/group - Create group chat

### 8.3 Message APIs
- GET /api/messages/:chatId - Get messages for chat
- POST /api/messages - Send message

## 9. Socket Events

### 9.1 Client to Server
- userOnline - User comes online
- userOffline - User goes offline
- joinChat - Join chat room
- sendMessage - Send new message
- markAsRead - Mark message as read
- typing - User is typing
- stopTyping - User stopped typing

### 9.2 Server to Client
- receiveMessage - New message received
- messageStatusUpdate - Message status changed
- userStatusChanged - User online/offline status changed
- userTyping - Other user is typing
- userStoppedTyping - Other user stopped typing

## 10. Constraints

### 10.1 Technical Constraints
- Requires active internet connection
- Requires modern browser with WebSocket support
- Requires MongoDB instance

### 10.2 Business Constraints
- Single message type (text only in current version)
- No end-to-end encryption
- No file uploads in current version

## 11. Assumptions and Dependencies

### 11.1 Assumptions
- Users have stable internet connection
- Browser supports ES6+ JavaScript
- MongoDB is properly configured

### 11.2 Dependencies
- MongoDB database availability
- Node.js server uptime
- Socket.IO connection stability

## 12. Future Enhancements

### 12.1 Planned Features
- Group chat functionality
- File and image sharing
- Voice and video calls
- Message editing and deletion
- Message search
- User profile management
- Profile picture uploads
- Message encryption
- Push notifications
- Mobile applications (iOS, Android)
- Message reactions (emoji)
- Voice messages
- Status updates
- Last seen privacy controls
- Block/unblock users

## 13. Acceptance Criteria

### 13.1 Core Features
- ✓ Users can login with any username
- ✓ Users can search and find other users
- ✓ Users can send and receive messages in real-time
- ✓ Message status updates correctly (sent → delivered → read)
- ✓ Online/offline status displays accurately
- ✓ Typing indicators work properly
- ✓ Messages persist across sessions
- ✓ UI matches WhatsApp design patterns

### 13.2 Performance
- ✓ Message delivery within 100ms
- ✓ No visible lag in UI interactions
- ✓ Smooth animations and transitions

### 13.3 Reliability
- ✓ No data loss
- ✓ Graceful error handling
- ✓ Connection recovery

## Document Version
**Version**: 1.0  
**Date**: December 17, 2025  
**Status**: Approved  
**Author**: Development Team
