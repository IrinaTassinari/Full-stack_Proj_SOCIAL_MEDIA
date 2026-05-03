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
    image: {
        type: String,
        required: true,
    }
}, {
    timestamps: true, // разрешаем создание полей createdAt и updatedAt
    versionKey: false // запрещаем создание поля __v
});
export const Post = mongoose.model('Post', postSchema);
