const express = require('express');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
require('dotenv').config()
app.use(cookieParser());

app.use(express.json());
const connectDb = require('./config/db.js');
const PORT = process.env.PORT || 8000;

const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRouter.js')
const treeRoutes = require('./routes/treeRoutes.js');
const donationRoutes = require('./routes/donationRoutes.js')
const errorHandler = require('./middlewares/errorHandler.js');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/trees',treeRoutes)
app.use('/donations',donationRoutes)

app.use(errorHandler);
app.listen(PORT,async () => {
    await connectDb();
    console.log(`Server is running on port : ${PORT}`)
});