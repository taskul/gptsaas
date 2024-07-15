const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'], 
        minlength: [6, 'Password must be at least 6 characters'],
        // we want select to be false because we don't want to send a user's password when we are querying for them
        // password field has select: false set. This means that whenever you query for a user, the password field will be excluded from the result by default. This is a good security practice to avoid accidentally exposing password hashes in API responses or logs.
        select: false
    },
    customerId: {
        type: String,
        default: '',
        unique: true
    },
    subscription: {
        type: String,
        default: ''
    },
});

// hash password before saving to database
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// compare password when logging in
userSchema.methods.matchPasswords = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// sign JWT and return
userSchema.methods.getSignedJwtToken = function(res) {
    // access token is short lived and has limited scope. Here we'll only use it to log in
    const accessToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    // refresh token is a token that is created along with the access token, and it's used to create a new access token when that original access token expires.
    const refreshToken = jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRE });
    res.cookie('refreshToken', `${refreshToken}`, {
        httpOnly: true,
        secure: true,
        maxAge: 86400 * 7000,
        sameSite: 'Strict' 
    });
    return { accessToken, refreshToken };
}

const User = mongoose.model('User', userSchema);
module.exports = User;