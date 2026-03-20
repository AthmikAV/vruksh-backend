const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config()
app.use(cookieParser());
app.use(express.json());
const connectDb = require('./config/db.js');
const PORT = process.env.POST;
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