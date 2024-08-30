const cloudinary = require("cloudinary").v2;

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

async function handleFileUpload(file, fileDirectory) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
    folder: fileDirectory,
  });
  return res;
}

async function handleFileDelete(fileCloudID, type = "image") {
  if (fileCloudID) return;

  const res = await cloudinary.uploader.destroy(fileCloudID, {
    resource_type: type,
  });

  return res;
}

exports.handleFileUpload = handleFileUpload;
exports.handleFileDelete = handleFileDelete;
