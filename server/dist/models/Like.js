import mongoose from "mongoose";
const likeSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
    versionKey: false
});
/**
 * user: 1, post: 1  - проверять пару user + post.  1 здесь нужен просто потому, что MongoDB требует указать направление индекса. Для уникальности это не главное.
 * { unique: true } - комбинация user + post должна быть уникальной - один пользователь может лайкнуть один пост только один раз
 */
likeSchema.index({ user: 1, post: 1 }, { unique: true });
export const Like = mongoose.model('Like', likeSchema);
