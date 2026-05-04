import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
        default: '',
    },
    // массив картинок
    image: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false
});
postSchema.index({ createdAt: -1 });
export const Post = mongoose.model('Post', postSchema);
