import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
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
}, {
    // Adds createdAt and updatedAt fields.
    timestamps: true,
    // Do not include the default __v version key.
    versionKey: false
});
userSchema.methods.comparePassword = async function (candidatePassword) {
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
export const User = mongoose.model('User', userSchema);
