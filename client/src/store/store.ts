import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postsSlice";
import profileReducer from "../features/profile/profileSlice";
import commentsReducer from "../features/comments/commentsSlice";
import likesReducer from "../features/likes/likesSlice";
import likesCommentReducer from "../features/likes/likesCommentSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import messagesReducer from "../features/messages/messagesSlice";
import messageNotificationsReducer from "../features/messageNotifications/messageNotificationsSlice";
import searchReducer from "../features/search/searchSlice";
import subscriptionsReducer from "../features/subscriptions/subscriptionsSlice";

// Central Redux store with all feature slices registered in one place.
const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
    comments: commentsReducer,
    likes: likesReducer,
    commentLikes: likesCommentReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
    messageNotifications: messageNotificationsReducer,
    search: searchReducer,
    subscriptions: subscriptionsReducer,
  },
});

// Typed helpers used by useAppDispatch and useAppSelector.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
