import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    }
}, {
    timestamps: true,
    versionKey: false
});
export const Comment = mongoose.model('Comment', commentSchema);
