const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

// if a user signs in correctly, it will display that JSON web token.
const sendToken = (user, statusCode, res) => {
    const token = user.getSignedJwtToken(res);
    res.status(statusCode).json({ success: true, token });
}

// register a user
exports.register = async (req, res, next) => {
    const { username, email, password } = req.body;

    // check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return next(new ErrorResponse('User already exists', 400));
    
    }

    try {
        const user = await User.create({
            username,
            email,
            password
        });

        sendToken(user, 201, res);
    } catch (error) {
        next(error);
    }
}

// login a user
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        const isMatch = await user.matchPasswords(password);
        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }   

        sendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
}

// logout a user
exports.logout = async (req, res) => {
    // clear the cookie we set in the getSignedJwtToken method and named refreshToken
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: "Logged out" });
}

exports.getRefreshToken = async (req, res, next) => {
    try {
        // a refresh token from cookies
        const getToken = req.cookies.refreshToken;

        if (getToken) {
            const token = jwt.verify(getToken, process.env.REFRESH_SECRET);
            const accessToken = jwt.sign({ id: token.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
            return res.status(200).json( accessToken );
        }
    } catch (error) {
        next(error);
    }
};

exports.getSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        return res.status(200).json({ subscription: user.subscription });
    } catch (error) {
        next(error);
    }
}

exports.getCustomer = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        return res.status(200).json({ customerId: user.customerId });
    } catch (error) {
        next(error);
    }
}