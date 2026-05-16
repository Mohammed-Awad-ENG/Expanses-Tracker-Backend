const express = require("express");
const app = express();
const port = 3000;
const { protect } = require("../middleware/authMiddleware.js");
const {
    registerUser,
    loginUser,
    getUserInfo,
} = require("../controllers/authController.js");
const upload = require("../middleware/uploadMiddleware.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// router.post("/upload-image", upload.single("image"), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }
//     const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
//     res.status(200).json({ imageUrl });
// });

// todo: handle upload-image
router.post("/upload-image", upload.single("image"), (req, res) => {
    res.status(200).json({ imageUrl: null });
});
module.exports = router;
