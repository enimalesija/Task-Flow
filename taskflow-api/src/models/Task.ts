import { Schema, model, models, Types } from "mongoose";

export interface ITask {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
  priority: "high" | "medium" | "low";
  dueDate?: number; // timestamp
  assignee?: { id?: string; name?: string } | string | null; // flexible
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["todo", "inprogress", "done"], default: "todo", index: true },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium", index: true },
    dueDate: { type: Number, default: null },
    assignee: { type: Schema.Types.Mixed, default: null }, // 👈 allows string or {id,name}
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Task = models.Task || model<ITask>("Task", taskSchema);
