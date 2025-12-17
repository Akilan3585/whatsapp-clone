# WhatsApp Clone - Low-Level Design (LLD)

## 1. Introduction

This document provides detailed low-level design specifications for the WhatsApp Clone application, including component implementations, data structures, algorithms, and code-level details.

## 2. Frontend Component Design

### 2.1 App.js - Main Application Container

#### 2.1.1 State Management
```javascript
State Variables:
- user: Object | null - Currently logged in user
- loggedInUsers: Array<Object> - List of users in current session
- chats: Array<Object> - User's conversation list
- selectedChat: Object | null - Currently active chat
- messages: Array<Object> - Messages in selected chat
- onlineUsers: Array<Object> - Online status of users
- typingUsers: Object - Users currently typing {userId: username}
```

#### 2.1.2 Effects & Lifecycle
```javascript
useEffect #1: Initial Load
- Purpose: Setup for multi-tab support
- Dependencies: []
- Action: Prepare for independent logins per tab

useEffect #2: User Online
- Purpose: Announce user presence
- Dependencies: [user]
- Actions:
  1. Emit 'userOnline' event
  2. Fetch user's chats
  3. Log user activity

useEffect #3: Join Chat
- Purpose: Subscribe to chat updates
- Dependencies: [selectedChat]
- Actions:
  1. Emit 'joinChat' event
  2. Fetch chat messages

useEffect #4: Socket Listeners
- Purpose: Handle real-time events
- Dependencies: []
- Listeners:
  - receiveMessage → Add to messages
  - messageStatusUpdate → Update message status
  - userStatusUpdate → Update online users
  - userTyping → Add to typingUsers
  - userStoppedTyping → Remove from typingUsers
```

#### 2.1.3 Key Functions
```javascript
fetchChats(userId)
  Input: userId (String)
  Process:
    1. GET /api/chats/${userId}
    2. Sort by updatedAt DESC
    3. Populate participants
  Output: Update chats state

fetchMessages(chatId)
  Input: chatId (String)
  Process:
    1. GET /api/messages/${chatId}
    2. Populate sender info
    3. Sort by createdAt ASC
  Output: Update messages state

handleNameSubmit(userData)
  Input: userData (Object)
  Process:
    1. Set user state
    2. Add to loggedInUsers
    3. Avoid duplicates
  Output: User logged in

handleSwitchUser(selectedUser)
  Input: selectedUser (Object)
  Process:
    1. Emit 'userOffline' for current user
    2. Switch to selectedUser
    3. Clear chat and messages
  Output: Active user switched

handleChatSelect(chat)
  Input: chat (Object)
  Process:
    1. Set selectedChat
    2. Fetch messages
    3. Emit joinChat
  Output: Chat opened

handleStartChat(chat)
  Input: chat (Object)
  Process:
    1. Check if chat exists in list
    2. Add to chats if new
    3. Select chat
  Output: New chat started

handleSendMessage(content)
  Input: content (String)
  Process:
    1. Validate content
    2. Create message data object
    3. Emit 'sendMessage' event
  Output: Message sent via socket
```

### 2.2 ChatWindow.js - Message Display

#### 2.2.1 Component Props
```javascript
Props:
- chat: Object | null - Current chat
- messages: Array<Object> - Message list
- onSendMessage: Function - Send callback
- currentUser: Object - Logged in user
- typingUsers: Object - Typing status
```

#### 2.2.2 Local State
```javascript
- message: String - Input field value
- isTyping: Boolean - Current user typing status
- typingTimeout: Timer - Typing indicator timeout
```

#### 2.2.3 Message Rendering Logic
```javascript
Algorithm: renderMessage(msg)
Input: msg (Message Object)
Process:
  1. Extract senderId from msg.sender
  2. Compare with currentUser._id
  3. Determine isOwnMessage boolean
  4. Get senderName
  5. Format timestamp
  6. Render appropriate style:
     - Own messages: Right aligned, green
     - Received: Left aligned, white
  7. Show status ticks for own messages only
Output: JSX Element

Status Tick Display:
  IF msg.status === 'sent'
    SHOW single grey tick (✓)
  ELSE IF msg.status === 'delivered'
    SHOW double grey ticks (✓✓)
  ELSE IF msg.status === 'read'
    SHOW double blue ticks (✓✓)
```

#### 2.2.4 Typing Indicator Logic
```javascript
Algorithm: handleInputChange(text)
Input: text (String)
Process:
  1. Update message state
  2. IF text.length > 0 AND !isTyping
       - Set isTyping = true
       - Emit 'typing' event
  3. Clear existing typingTimeout
  4. IF text.length > 0
       - Set new timeout (2000ms)
       - On timeout:
         * Set isTyping = false
         * Emit 'stopTyping' event
Output: Updated state and socket events
```

#### 2.2.5 Mark as Read Logic
```javascript
Algorithm: markMessagesAsRead()
Input: messages array, currentUser, chat
Process:
  FOR each msg in messages
    IF msg.sender._id !== currentUser._id
       AND currentUser._id NOT IN msg.readBy
      THEN
        socket.emit('markAsRead', {
          messageId: msg._id,
          userId: currentUser._id,
          chatId: chat._id
        })
Output: Read receipts sent
```

### 2.3 UserSearch.js - User Discovery

#### 2.3.1 State Management
```javascript
- users: Array<Object> - All users from DB
- searchTerm: String - Search input
- filteredUsers: Array<Object> - Search results
```

#### 2.3.2 Search Algorithm
```javascript
Algorithm: filterUsers(searchTerm, users, currentUser)
Input:
  - searchTerm: String
  - users: Array<Object>
  - currentUser: Object
Process:
  1. IF searchTerm is empty
       RETURN []
  2. Convert searchTerm to lowercase
  3. Filter users WHERE:
       - username contains searchTerm (case-insensitive)
       - user._id !== currentUser._id
  4. Return filtered array
Output: filteredUsers
```

#### 2.3.3 Chat Creation Flow
```javascript
Algorithm: handleUserClick(user)
Input: user (Object)
Process:
  1. Create participants array [currentUser._id, user._id]
  2. POST /api/chats with:
     {
       participants: [currentUser._id, user._id],
       isGroup: false
     }
  3. Backend checks for existing chat
  4. IF exists: Return existing chat
     ELSE: Create new chat
  5. Call onStartChat(chat)
  6. Clear searchTerm
Output: Chat created/retrieved and opened
```

### 2.4 UserSwitcher.js - Account Management

#### 2.4.1 State
```javascript
- showDropdown: Boolean - Dropdown visibility
- newUsername: String - New user input
- showAddUser: Boolean - Add user form visibility
```

#### 2.4.2 Add User Flow
```javascript
Algorithm: handleAddUser()
Input: newUsername
Process:
  1. Validate newUsername (non-empty, trimmed)
  2. POST /api/users/by-name
     Body: { username: newUsername }
  3. Receive user object
  4. Call onAddUser(user)
  5. Call onSwitchUser(user) - Auto login
  6. Clear form
  7. Close dropdown
Output: New user added and logged in
```

#### 2.4.3 Logout Flow
```javascript
Algorithm: handleLogout(userId)
Input: userId (String)
Process:
  1. Show confirmation dialog
  2. IF confirmed
       - Call onLogoutUser(userId)
       - Remove from loggedInUsers
       - IF userId === currentUser._id
           * Emit 'userOffline'
           * Switch to another user OR show login
Output: User logged out
```

## 3. Backend Component Design

### 3.1 Server.js - Main Server

#### 3.1.1 Initialization Sequence
```javascript
1. Load environment variables (dotenv)
2. Create Express app
3. Create HTTP server
4. Initialize Socket.IO with CORS
5. Apply middleware (cors, json parser)
6. Connect to MongoDB
7. Mount routes:
   - /api/users
   - /api/chats
   - /api/messages
8. Setup Socket.IO event handlers
9. Start server on PORT
```

#### 3.1.2 Socket Event Handlers

##### userOnline Handler
```javascript
Event: 'userOnline'
Input: userId (String)
Algorithm:
  1. Add userId to activeUsers Map
  2. Update User document:
     User.findByIdAndUpdate(userId, { online: true })
  3. Broadcast to all clients:
     io.emit('userStatusChanged', {
       userId: userId,
       online: true
     })
  4. Log activity
Output: User marked online globally
```

##### sendMessage Handler
```javascript
Event: 'sendMessage'
Input: { chatId, senderId, senderName, content }
Algorithm:
  1. Create Message document:
     {
       chat: chatId,
       sender: senderId,
       content: content,
       status: 'sent'
     }
  2. Save to database
  3. Populate sender field
  4. Create messageData with senderName
  5. Broadcast to chat room:
     io.to(chatId).emit('receiveMessage', messageData)
  6. Set timeout (500ms):
     - Update message.status = 'delivered'
     - Save to database
     - Emit 'messageStatusUpdate' to chatId
Output: Message sent and delivered
```

##### markAsRead Handler
```javascript
Event: 'markAsRead'
Input: { messageId, userId, chatId }
Algorithm:
  1. Find message by messageId
  2. IF userId NOT IN message.readBy
       - Add userId to readBy array
  3. Get chat participants
  4. Check if all participants (except sender) have read
  5. IF all read
       - Set message.status = 'read'
     ELSE
       - Set message.status = 'delivered'
  6. Save message
  7. Emit 'messageStatusUpdate' to chatId:
     {
       messageId: message._id,
       status: message.status
     }
Output: Message marked as read, status updated
```

##### typing Handler
```javascript
Event: 'typing'
Input: { chatId, userId, username }
Algorithm:
  1. Broadcast to chat room (except sender):
     socket.to(chatId).emit('userTyping', {
       userId: userId,
       username: username
     })
Output: Typing notification sent
```

##### userOffline Handler
```javascript
Event: 'userOffline'
Input: userId (String)
Algorithm:
  1. Remove from activeUsers Map
  2. Update database:
     User.findByIdAndUpdate(userId, {
       online: false,
       lastSeen: Date.now()
     })
  3. Broadcast:
     io.emit('userStatusChanged', {
       userId: userId,
       online: false
     })
Output: User marked offline
```

### 3.2 Routes Design

#### 3.2.1 users.js Routes

##### POST /api/users/by-name
```javascript
Purpose: Create or get user by username
Input: { username: String }
Algorithm:
  1. Validate username (required, non-empty)
  2. Clean username (trim, lowercase)
  3. Search database:
     User.findOne({ username: cleanUsername })
  4. IF user exists
       RETURN user object
     ELSE
       - Generate unique email
       - Create new User:
         {
           username: cleanUsername,
           email: generated email,
           password: 'auto-generated'
         }
       - Save to database
       - RETURN new user
Output: User object (200 or 201)
Error: 400 with error message
```

##### GET /api/users
```javascript
Purpose: Get all users
Algorithm:
  1. Find all users in database
  2. Exclude password field
  3. Sort by createdAt DESC
Output: Array of user objects
```

#### 3.2.2 chats.js Routes

##### POST /api/chats
```javascript
Purpose: Create or get existing chat
Input: { participants: [userId1, userId2], isGroup: Boolean }
Algorithm:
  1. IF !isGroup AND participants.length === 2
       - Check for existing chat:
         Chat.findOne({
           isGroup: false,
           participants: { $all: participants, $size: 2 }
         })
       - IF exists
           * Populate participants
           * RETURN existing chat
  2. ELSE create new chat:
     - Create Chat document
     - Save to database
     - Populate participants
     - RETURN new chat
Output: Chat object
```

##### GET /api/chats/:userId
```javascript
Purpose: Get all chats for a user
Input: userId (URL parameter)
Algorithm:
  1. Find chats WHERE participants includes userId
  2. Populate participants (username, avatar, online, lastSeen)
  3. Populate lastMessage
  4. Sort by updatedAt DESC
Output: Array of chat objects
```

#### 3.2.3 messages.js Routes

##### GET /api/messages/:chatId
```javascript
Purpose: Get all messages in a chat
Input: chatId (URL parameter)
Algorithm:
  1. Find messages WHERE chat === chatId
  2. Populate sender (username, avatar)
  3. Sort by createdAt ASC
  4. FOR each message
       IF message.status === 'sent'
         - Update to 'delivered'
         - Save
  5. RETURN messages array
Output: Array of message objects
```

## 4. Database Design

### 4.1 Indexes

#### Users Collection
```javascript
Indexes:
- { username: 1 } - unique
- { email: 1 } - unique, sparse
- { online: 1 } - for filtering online users
```

#### Chats Collection
```javascript
Indexes:
- { participants: 1 } - for user chat queries
- { updatedAt: -1 } - for sorting recent chats
- { participants: 1, isGroup: 1 } - compound for finding specific chats
```

#### Messages Collection
```javascript
Indexes:
- { chat: 1, createdAt: 1 } - for chat messages sorted by time
- { sender: 1 } - for user's sent messages
- { status: 1 } - for status queries
```

### 4.2 Data Validation

#### User Model Validation
```javascript
username:
  - type: String
  - required: true
  - unique: true
  - lowercase: true
  - trim: true
  - minlength: 2
  - maxlength: 30

email:
  - type: String
  - unique: true
  - sparse: true (allows multiple null/undefined)
  - match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

online:
  - type: Boolean
  - default: false
```

#### Message Model Validation
```javascript
content:
  - type: String
  - required: true
  - trim: true
  - maxlength: 10000

status:
  - type: String
  - enum: ['sent', 'delivered', 'read']
  - default: 'sent'

messageType:
  - type: String
  - enum: ['text', 'image', 'file']
  - default: 'text'
```

## 5. Algorithms

### 5.1 Message Status Update Algorithm
```
FUNCTION updateMessageStatus(messageId, userId, chatId):
  1. message = findMessageById(messageId)
  2. IF message is NULL
       RETURN error
  
  3. IF userId NOT IN message.readBy
       - APPEND userId to message.readBy
  
  4. chat = findChatById(chatId)
  5. totalParticipants = chat.participants.length
  6. readCount = message.readBy.length
  
  7. senderId = message.sender
  8. participantsExceptSender = totalParticipants - 1
  
  9. IF readCount >= participantsExceptSender
       - message.status = 'read'
     ELSE IF readCount > 0
       - message.status = 'delivered'
     ELSE
       - message.status = 'sent'
  
  10. SAVE message
  11. BROADCAST status update to chat
  
  RETURN success
```

### 5.2 Chat Deduplication Algorithm
```
FUNCTION findOrCreateChat(user1Id, user2Id):
  1. participants = [user1Id, user2Id]
  
  2. existingChat = Database.findOne({
       collection: 'chats',
       query: {
         isGroup: false,
         participants: {
           $all: participants,
           $size: 2
         }
       }
     })
  
  3. IF existingChat EXISTS
       RETURN existingChat
  
  4. newChat = CREATE Chat({
       participants: participants,
       isGroup: false
     })
  
  5. SAVE newChat to database
  6. RETURN newChat
```

### 5.3 Online Users Tracking
```
DATA STRUCTURE:
  activeUsers = Map<userId: String, socketId: String>

FUNCTION onUserConnect(socket, userId):
  1. activeUsers.set(userId, socket.id)
  2. Database.update(User, userId, { online: true })
  3. BROADCAST userOnline event

FUNCTION onUserDisconnect(socket):
  1. FOR each (userId, socketId) IN activeUsers
       IF socketId === socket.id
         - activeUsers.delete(userId)
         - Database.update(User, userId, {
             online: false,
             lastSeen: NOW()
           })
         - BROADCAST userOffline event
         - BREAK
```

## 6. Error Handling

### 6.1 Frontend Error Handling
```javascript
Try-Catch Pattern:
try {
  const response = await axios.get(url)
  // Process response
} catch (error) {
  console.error('Error:', error.message)
  // Show user-friendly message
  alert(error.response?.data?.error || 'An error occurred')
}

Socket Error Handling:
socket.on('error', (error) => {
  console.error('Socket error:', error)
  // Attempt reconnection
  socket.connect()
})
```

### 6.2 Backend Error Handling
```javascript
Route Error Pattern:
router.post('/endpoint', async (req, res) => {
  try {
    // Process request
    res.json(result)
  } catch (error) {
    console.error('Error:', error.message)
    res.status(400).json({ error: error.message })
  }
})

Socket Error Pattern:
socket.on('event', async (data) => {
  try {
    // Process event
  } catch (error) {
    console.error('Socket error:', error)
    socket.emit('error', error.message)
  }
})
```

## 7. Performance Optimizations

### 7.1 Frontend Optimizations
```javascript
1. React.memo for expensive components
2. useCallback for event handlers
3. Debouncing search input (300ms)
4. Virtual scrolling for long chat lists
5. Lazy loading images
6. Message pagination (50 per page)
```

### 7.2 Backend Optimizations
```javascript
1. Database connection pooling
2. Query result limiting
3. Field projection (exclude unnecessary fields)
4. Indexing on frequently queried fields
5. Socket room-based broadcasting
6. Mongoose lean() for read-only queries
```

## 8. Testing Specifications

### 8.1 Unit Tests
```javascript
Component Tests:
- ChatWindow renders correctly
- Message status displays correct ticks
- User search filters correctly
- UserSwitcher dropdown works

API Tests:
- POST /api/users/by-name creates user
- GET /api/chats returns user chats
- Message CRUD operations
```

### 8.2 Integration Tests
```javascript
- User login flow end-to-end
- Message send and receive flow
- Socket event propagation
- Database persistence
```

## Document Information
**Version**: 1.0  
**Date**: December 17, 2025  
**Status**: Final  
**Author**: Development Team
