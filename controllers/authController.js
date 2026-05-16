const User = require("../models/User");
const jwt = require("jsonwebtoken");
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body || {};

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({
            fullName,
            email,
            password, // hash this in the User model pre-save hook
            profileImageUrl,
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            message: "User registered successfully",
            user,
            token,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error registering user",
            error: err.message,
        });
    }
};
exports.loginUser = async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password.toString()))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.status(200).json({
            message: "User logged in successfully",
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({
            message: "Error logging in user",
            error: err.message,
        });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        res.status(500).json({
            message: "Error fetching user info",
            error: err.message,
        });
    }
};