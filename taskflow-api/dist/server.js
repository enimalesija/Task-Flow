"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
async function start() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');
        index_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('❌ Failed to start server', err);
        process.exit(1);
    }
}
start();
