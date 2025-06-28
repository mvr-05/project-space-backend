const express = require("express");
const router = express.Router();
const { profiles } = require("../config/cloudinary.config");

router.post("/upload-profile", profiles.single("image"), (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      imageUrl: req.file.path, 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Upload failed" });
  }
});

module.exports = router;