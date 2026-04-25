const express = require('express');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
require('dotenv').config() // ← move to top

const app = express();

app.use(cors({
  origin: '*', // ← change to * for now, fix after deploy
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

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
app.use('/trees', treeRoutes);
app.use('/donations', donationRoutes);
app.use(errorHandler);

// ← connect DB before listening
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
  });
});