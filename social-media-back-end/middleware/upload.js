const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, callback) => {
    callback(
      null,
      `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const pattern = /jpg|png|jpeg|gif/i;
    if (pattern.test(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("File must be an image"));
    }
  },
});

module.exports = upload;
