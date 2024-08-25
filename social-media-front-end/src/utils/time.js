export function compareDates(newDate, oldDate) {
  const difference = (new Date(newDate) - new Date(oldDate)) / 1000;
  return difference <= 60 * 5;
}

export function getDateString(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const differenceInSeconds = (now - date) / 1000;

  let dateDescription = "";

  if (differenceInSeconds < 60) {
    dateDescription = "Now";
  } else if (differenceInSeconds < 60 * 60) {
    dateDescription = `${Math.floor(differenceInSeconds / 60)} Minute`;
  } else if (differenceInSeconds < 60 * 60 * 24) {
    dateDescription = `${Math.floor(differenceInSeconds / (60 * 60))} Hour`;
  } else if (differenceInSeconds < 60 * 60 * 24 * 30) {
    dateDescription = `${Math.floor(differenceInSeconds / (60 * 60 * 24))} Day`;
  } else if (differenceInSeconds < 60 * 60 * 24 * 30 * 12) {
    dateDescription = `${Math.floor(
      differenceInSeconds / (60 * 60 * 24 * 30)
    )} Month`;
  } else {
    dateDescription = `${Math.floor(
      differenceInSeconds / (60 * 60 * 24 * 30 * 12)
    )} Year`;
  }

  return dateDescription;
}
