const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wasteDb_uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

module.exports = upload;
