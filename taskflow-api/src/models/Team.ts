import { Schema, model, models, Types } from "mongoose";

export interface ITeam {
  _id: Types.ObjectId;
  name: string;
  members: Types.ObjectId[]; // user ids
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Safe export (prevents OverwriteModelError on hot reloads)
export const Team = models.Team || model<ITeam>("Team", teamSchema);
