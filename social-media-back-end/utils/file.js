const fs = require("fs");

function createDirIfNotExists(path, error) {
  const directoriesArray = path.split("/");
  let currentDirectory = "./";

  directoriesArray.forEach((directory) => {
    if (directory === ".") return;

    currentDirectory += `${directory}/`;

    if (!fs.existsSync(currentDirectory)) {
      fs.mkdirSync(currentDirectory);
    }
  });

  return fs.existsSync(currentDirectory);
}

function createFile(file, fileName, path, error) {
  if (!createDirIfNotExists(path, error))
    return console.log("File Already Exists");
  fs.writeFile(path + fileName, file, (err) => {
    if (err) error(`Cannot save files ${err}`);
  });
}

function deleteFile(path, error) {
  if (!error) throw new Error("error callback is null");

  fs.unlink(path, (err) => {
    if (err) error(`Could not remove the posts image: ${err}`);
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
exports.createFile = createFile;
