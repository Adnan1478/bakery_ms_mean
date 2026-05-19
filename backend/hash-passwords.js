const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const hashPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:21717/bakerymss');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        for (let user of users) {
            // If password doesn't look like a hash (bcrypt hashes start with $2a$ or $2b$), hash it
            if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                console.log(`Hashing password for user: ${user.email}`);
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                await user.save();
            }
        }

        console.log('Finished hashing plain passwords');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

hashPasswords();
