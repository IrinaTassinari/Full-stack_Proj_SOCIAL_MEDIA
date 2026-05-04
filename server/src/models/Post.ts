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
        // массив картинок
        image: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true, 
        versionKey: false 
    }
);

postSchema.index({ createdAt: -1 });


export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);