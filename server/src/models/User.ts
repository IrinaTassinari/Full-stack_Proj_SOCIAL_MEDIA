import mongoose, { Document, Model } from "mongoose";
import bcrypt from 'bcrypt';

// Mongoose document type for application users.
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  website?: string;
  avatar?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
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
            minlength: 3,
            maxlength: 30,
            match: [
              /^[A-Za-z0-9._]+$/,
              "Username can contain only Latin letters, numbers, underscores, and periods",
            ],
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
            // Password hashes are excluded from queries unless explicitly selected.
            select: false,
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
        website: {
            type: String,
            default: '',
            trim: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        }
    },
    {
        // Adds createdAt and updatedAt fields.
        timestamps: true,
        // Do not include the default __v version key.
        versionKey: false
    }
);


userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Compare the plain login password with the stored password hash.
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.pre('save', async function () {
  // Hash the password only when it was created or changed.
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});


export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
