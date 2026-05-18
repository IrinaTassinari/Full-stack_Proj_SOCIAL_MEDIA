# ICHGRAM

ICHGRAM is a full-stack social media application inspired by Instagram. The project includes a React frontend, a Node.js/Express API, MongoDB persistence, JWT authentication, Cloudinary image uploads, and Socket.io infrastructure for real-time private messaging.

The application currently supports authentication, profile management, post creation with multi-image galleries, profile and explore feeds, post editing/deletion, comments/likes API endpoints, subscriptions, notifications, and messaging endpoints.

## Current Status

The project is in active development. The backend API is implemented for the main social-media workflows and has been tested during development. The frontend is integrated for the core user flow:

- sign up, log in, forgot/reset password pages
- protected application layout
- home feed
- explore page
- profile page
- edit profile
- create post
- edit post
- multi-image post galleries

Some backend features already have API support but are not fully represented as finished frontend screens yet. For example, messages and notifications have server-side routes and state logic, while the main routes currently still contain placeholder pages in the UI.

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
- Express
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

- User registration
- User login
- JWT-based protected routes
- Forgot password flow
- Reset password flow
- Guest-only and protected frontend routing

### Profile

- View own profile
- Edit profile data
- Upload/update avatar through Cloudinary
- User search API
- Public user profile API

### Posts

- Create posts
- Edit posts
- Delete posts
- Load all posts for the home feed
- Load user posts for profile pages
- Load random explore posts
- Cloudinary image upload
- Frontend preview before publishing
- File-size validation before upload
- Multi-image gallery support
- Gallery carousel in post preview
- Gallery editing with add/remove image support

### Social Features

- Likes API
- Comments API
- Follow/unfollow subscriptions
- Followers/following API
- Notification API for likes, comments, and follows

### Messaging

- Private message API
- Chat history endpoint
- Chat list endpoint
- Message notification API
- Socket.io real-time message delivery infrastructure

## Multi-Image Post Gallery

The original project requirement described post creation with one image per post. During development, the post feature was extended to support gallery-style posts, similar to Instagram, where one post can contain multiple images.

Because some posts had already been created with the original single-image structure, the `Post` model currently supports both fields:

- `image`: legacy field used by older posts that contain one image.
- `images`: current field used by new gallery posts. It stores an array of image URLs and supports up to 10 images per post.

This keeps old posts visible while allowing new posts to use the gallery format. On the frontend, post images are resolved by using `images` when available and falling back to `image` for legacy posts.

Gallery behavior currently includes:

- selecting up to 10 photos when creating a post
- previewing selected photos as one carousel before publishing
- adding more photos before publishing
- removing selected photos before publishing
- editing an existing gallery post
- removing one image from an existing post gallery
- keeping existing image URLs and uploading only newly added files during post edit
- showing a gallery counter such as `1/3`

Each image must be smaller than 10 MB. Oversized images are rejected before upload on the frontend and also protected by the backend upload middleware.

## Project Structure

```text
client/
  public/
    icons/
    images/
  src/
    components/
    features/
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

## Installation

Install dependencies separately for the server and the client.

```bash
cd server
npm install
```

```bash
cd client
npm install
```

## Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

The frontend uses this default API URL if no Vite variable is provided:

```text
http://localhost:3000
```

Optionally, create a `.env` file inside `client`:

```env
VITE_API_URL=http://localhost:3000
```

## Running Locally

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

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

## Build Commands

Build the backend:

```bash
cd server
npm run build
```

Start the compiled backend:

```bash
cd server
npm start
```

Build the frontend:

```bash
cd client
npm run build
```

Preview the frontend production build:

```bash
cd client
npm run preview
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
GET /api/users/:id
GET /api/users/me
PATCH /api/users/me
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

Post creation and update use `multipart/form-data`.

For new gallery posts:

```text
images: File[]
description: string
```

For editing gallery posts:

```text
existingImages: stringified array of image URLs to keep
images: File[] for newly added files
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

## Socket.io Messaging Flow

The server creates a personal room for each connected user.

Client joins its room:

```js
socket.emit("join", userId);
```

Client receives a new message:

```js
socket.on("receiveMessage", (message) => {
  console.log(message);
});
```

Message flow:

1. A user sends a message with `POST /api/messages/:receiverId`.
2. The message is saved in MongoDB.
3. A message notification is created for the receiver.
4. Socket.io emits a `receiveMessage` event to the receiver's personal room.
5. The receiver can load the conversation and chat list with the message endpoints.

## Postman Documentation

```text
https://documenter.getpostman.com/view/53300232/2sBXqJKLvf
```

## Development Notes

- The project keeps generated `server/dist` files after backend builds.
- Existing legacy posts with `image` are still supported.
- New and edited posts should use `images`.
- The frontend validates selected image size before upload.
- The backend also enforces the same 10 MB file-size limit.
- Some UI pages are still being developed even though their backend APIs already exist.




