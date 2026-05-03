import mongoose, { Document, Model } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  description?: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>(
    {
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
    },
    {
        timestamps: true, // разрешаем создание полей createdAt и updatedAt
        versionKey: false // запрещаем создание поля __v
    }
);

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);