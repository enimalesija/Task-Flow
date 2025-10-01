import { Schema, model, models, Types, Document } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  passwordHash?: string;   // 👈 make optional for delete safety
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
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  },
  { timestamps: true }
);

// ✅ Hide passwordHash in JSON responses
userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    if (ret.passwordHash) {
      delete ret.passwordHash;
    }
    return ret;
  },
});

const User = models.User || model<IUser>("User", userSchema);
export default User;
