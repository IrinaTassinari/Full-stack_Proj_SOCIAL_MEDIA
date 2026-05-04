import mongoose from "mongoose";
const subscribeSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false
});
// чтобы один пользователь не мог подписаться на другого несколько раз
subscribeSchema.index({ follower: 1, following: 1 }, { unique: true });
export const Subscribe = mongoose.model('Subscribe', subscribeSchema);
