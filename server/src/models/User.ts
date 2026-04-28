import mongoose, { Document, Model } from "mongoose";
import bcrypt from 'bcrypt';


export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },

    },
    {
        timestamps: true, // разрешаем создание полей createdAt и updatedAt
        versionKey: false // запрещаем создание поля __v
    }
);

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});


export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);




