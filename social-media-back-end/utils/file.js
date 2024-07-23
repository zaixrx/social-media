const { log } = require("console");
const fs = require("fs");

function deleteFile(path) {
  fs.unlink(path, (error) => {
    if (error)
      console.log(`Could not remove the posts image: ${error.message}`);
  });
}

function generatePath(filePath) {
  return `http:\\\\${process.env.HOST_NAME}:${
    process.env.PORT
  }${filePath.replace("public", "")}`;
}

function getNameFromPath(path) {
  const fileName = path.slice(path.lastIndexOf("\\") + 1);
  return `${require.main.path}\\public\\images\\${fileName}`;
}

exports.deleteFile = deleteFile;
exports.generatePath = generatePath;
exports.getNameFromPath = getNameFromPath;
