import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postsSlice";
// import commentsReducer from "../features/comments/commentsSlice";
// import likesReducer from "../features/likes/likesSlice";
// import notificationsReducer from "../features/notifications/notificationsSlice";
// import messagesReducer from "../features/messages/messagesSlice";
// import messageNotificationsReducer from "../features/messageNotifications/messageNotificationsSlice";
// import profileReducer from "../features/profile/profileSlice";
// import searchReducer from "../features/search/searchSlice";
// import subscriptionsReducer from "../features/subscriptions/subscriptionsSlice";

 const store = configureStore({
  reducer: {
    auth: authReducer, 
    posts: postsReducer,
    // comments: commentsReducer,
    // likes: likesReducer,
    // notifications: notificationsReducer,
    // messages: messagesReducer,
    // messageNotifications: messageNotificationsReducer,
    // profile: profileReducer,
    // search: searchReducer,
    // subscriptions: subscriptionsReducer,
  },
});

//Это TypeScript-тип всего Redux state
export type RootState = ReturnType<typeof store.getState>;
//Это TypeScript-тип dispatch
export type AppDispatch = typeof store.dispatch;

export default store;


/**
 *  создаёт общий Redux store
  подключает все slices
  экспортирует типы RootState и AppDispatch
 */

