const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected Succesfully');
    } catch (error) {
        console.log('MongoDb connection failed ERROR : ', error.message);
        process.exit(1);
    }
}

module.exports = connectDb;