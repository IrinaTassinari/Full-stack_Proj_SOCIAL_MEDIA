import mongoose, { Document, Model } from "mongoose";

export interface ISubscribe extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscribeSchema = new mongoose.Schema<ISubscribe>(
    {
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
    },
    {
        timestamps: true, 
        versionKey: false 
    }
);
// чтобы один пользователь не мог подписаться на другого несколько раз
subscribeSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Subscribe: Model<ISubscribe> = mongoose.model<ISubscribe>('Subscribe', subscribeSchema);