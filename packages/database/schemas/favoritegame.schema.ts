import { Schema, model, Document, Types } from 'mongoose';

export interface IFavoriteGame extends Document {
  userId: Types.ObjectId;
  gameType: string;
  createdAt: Date;
}

const favoriteGameSchema = new Schema<IFavoriteGame>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, required: true }
}, { timestamps: true });

favoriteGameSchema.index({ userId: 1, gameType: 1 }, { unique: true });

export const FavoriteGame = model<IFavoriteGame>('FavoriteGame', favoriteGameSchema);