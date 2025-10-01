import { Schema, model, models, Types, Document } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  passwordHash: string;             // ✅ required, not optional
  role: "member" | "admin";
  teams?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true, unique: true },
    avatar: String,
    passwordHash: { type: String, required: true },   // ✅ ensure always saved
    role: { type: String, enum: ["member", "admin"], default: "member" },
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  },
  { timestamps: true }
);

// Optional: remove passwordHash when converting to JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = models.User || model<IUser>("User", userSchema);
