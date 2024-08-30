const multer = require("multer");
const storage = multer.memoryStorage();
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
