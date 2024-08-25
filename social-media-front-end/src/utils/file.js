export function getFileUrl(file) {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error(error);
  }
}
