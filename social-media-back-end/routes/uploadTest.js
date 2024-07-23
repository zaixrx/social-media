const router = require("express").Router();
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
    const pattern = /jpg|png|jpeg/i;
    const isImage = pattern.test(file.mimetype);
    if (isImage) {
      callback(null, true);
    } else {
      callback(new Error("File must be an image"));
    }
  },
});

router.post("/", upload.single("file"), (req, res) => {
  res.send(req.file);
});

module.exports = router;
