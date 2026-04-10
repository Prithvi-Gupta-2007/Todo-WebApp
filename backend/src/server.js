import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import todoRoutes from './routes/todoRoutes.js';
import { connectDB } from './config/db.js';

// Load environment variables FIRST
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 9889;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',           // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

// Connect to Database and Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Database connection failed:", error);
});