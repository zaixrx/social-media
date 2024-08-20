export function getFileUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve("File is undefined");

    let reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsDataURL(file);
  });
}
