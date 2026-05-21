# ICHGRAM

ICHGRAM is a full-stack Instagram-style social media application built with React, TypeScript, Express, MongoDB, Cloudinary, JWT authentication, and Socket.io.

The app supports authentication, profile management, post galleries, home and explore feeds, likes, comments, subscriptions, notifications, user search, and private messaging.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Redux Toolkit
- Axios
- CSS Modules
- Socket.io Client
- Emoji Picker React

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Cloudinary
- Nodemailer
- Socket.io

## Features

### Authentication

- Sign up
- Log in
- JWT-based protected routes
- Forgot password
- Reset password by email token
- Guest-only and protected frontend routing

### Profiles

- View own profile
- Edit profile information
- Upload/update avatar through Cloudinary
- View public user profiles
- Search users
- View followers and following lists
- Follow and unfollow users
- Open a direct message from another user's profile

### Posts

- Create posts
- Edit posts
- Delete own posts
- Upload images to Cloudinary
- Create gallery posts with up to 10 images
- Support legacy single-image posts
- Preview selected images before publishing
- Edit existing gallery posts
- Remove existing images while editing
- Home feed
- Random Explore feed with pagination
- Post preview modal with image navigation

### Social Features

- Like/unlike posts
- Display likes count
- Add comments
- Delete own comments
- Display latest comments in the home feed
- View all comments in the post modal
- Like, comment, and follow notifications
- Dedicated notifications page and overlay panel

### Messaging

- Private conversations
- Chat list
- Conversation history
- Send messages
- Message notification state
- Socket.io infrastructure for real-time delivery
- Empty chat state with suggested users from following list

### Responsive UI

- Desktop sidebar navigation
- Compact icon sidebar on tablet widths
- Burger/drawer sidebar on very small screens
- Responsive Explore grid
- Responsive profile grids
- Mobile pages for search and notifications
- Responsive post preview modal
- Responsive messages layout

## Project Structure

```text
client/
  public/
    icons/
    images/
  src/
    components/
      layout/
      messages/
      posts/
      routes/
      subscriptions/
      ui/
    features/
      auth/
      comments/
      likes/
      messageNotifications/
      messages/
      notifications/
      posts/
      profile/
      search/
      subscriptions/
    pages/
    store/
    types/
    utils/

server/
  src/
    config/
    controllers/
    db/
    middlewares/
    models/
    routes/
    socket/
    types/
    utils/
```

## Requirements

- Node.js 22 or compatible recent Node version
- npm
- MongoDB database
- Cloudinary account
- SMTP/email provider for password reset emails
- Docker Desktop, optional

## Environment Variables

Create `server/.env`:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=ICHGRAM <your_email@example.com>
```

Optional local frontend env file: `client/.env`

```env
VITE_API_URL=http://localhost:3000
```

For Docker Compose, the frontend uses Vite proxy settings:

```env
VITE_API_URL=
VITE_PROXY_TARGET=http://ichgram:3000
```

This lets browser requests go through the Vite dev server while the container talks to the backend service by Docker service name.

## Local Development

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Default URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

## Docker

Build and start both containers:

```bash
docker compose up -d --build
```

Stop containers:

```bash
docker compose down
```

Docker services:

```text
ichgram       backend   http://localhost:3000
front_ichgram frontend  http://localhost:5173
```

MongoDB is not started by default in `docker-compose.yml`. The backend currently expects `MONGO_URL` from `server/.env`, so you can use MongoDB Atlas or uncomment/configure the MongoDB service in the compose file.

## Build Commands

Backend:

```bash
cd server
npm run build
npm start
```

Frontend:

```bash
cd client
npm run build
npm run preview
```

Type-check frontend:

```bash
cd client
npx tsc -b
```

## API Overview

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
PATCH /api/auth/reset-password/:token
```

### Users

```http
GET /api/users/search
GET /api/users/me
PATCH /api/users/me
GET /api/users/:id
```

### Posts

```http
GET /api/posts
GET /api/posts/explore
GET /api/posts/user/:userId
GET /api/posts/:id
POST /api/posts
PATCH /api/posts/:id
DELETE /api/posts/:id
```

Post create/update uses `multipart/form-data`.

Create a new gallery post:

```text
images: File[]
description: string
```

Edit a gallery post:

```text
existingImages: JSON stringified array of image URLs to keep
images: File[] for newly added images
description: string
```

### Likes

```http
GET /api/likes/:postId
POST /api/likes/:postId
```

### Comments

```http
GET /api/comments/:postId
POST /api/comments/:postId
DELETE /api/comments/:commentId
```

### Subscriptions

```http
POST /api/subscriptions/:userId
DELETE /api/subscriptions/:userId
GET /api/subscriptions/:userId/followers
GET /api/subscriptions/:userId/following
```

### Notifications

```http
GET /api/notifications
PATCH /api/notifications/read-all
PATCH /api/notifications/:notificationId/read
```

### Messages

```http
POST /api/messages/:receiverId
GET /api/messages/allchats
GET /api/messages/:userId
```

### Message Notifications

```http
GET /api/message-notifications
PATCH /api/message-notifications/read-all
PATCH /api/message-notifications/:notificationId/read
```

## Socket.io Messaging

The server creates a personal Socket.io room for each user.

Client joins its room:

```js
socket.emit("join", userId);
```

Client receives messages:

```js
socket.on("receiveMessage", (message) => {
  console.log(message);
});
```

Message flow:

1. A user sends a message through `POST /api/messages/:receiverId`.
2. The backend saves the message in MongoDB.
3. A message notification is created for the receiver.
4. Socket.io emits `receiveMessage` to the receiver's personal room.
5. The frontend updates chat/message state through Redux thunks.

## Gallery Compatibility

The app supports both old and new post image formats:

- `image`: legacy single-image field.
- `images`: current gallery field with multiple image URLs.

Frontend image utilities prefer `images` when available and fall back to `image`, so older posts remain visible.

Current upload rules:

- Up to 10 images per post.
- Each image must be under 10 MB.
- Frontend validates file size before upload.
- Backend upload middleware also enforces the limit.

## Postman Documentation

```text
https://documenter.getpostman.com/view/53300232/2sBXqJKLvf
```

## Notes

- The project is under active development.
- `server/dist` can be generated by backend builds.
- Docker currently runs the Vite development server for the frontend container.
- For production deployment, replace the frontend Docker workflow with a production static build served by Nginx or another static server.
- Some frontend requests are intentionally batched at page level to reduce browser resource pressure from many per-card API calls.
