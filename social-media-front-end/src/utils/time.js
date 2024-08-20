export function compareDates(newDate, oldDate) {
  const difference = (new Date(newDate) - new Date(oldDate)) / 1000;
  console.log(difference);
  return difference <= 60 * 5;
}

export function getDateString(dateString) {
  const date = new Date(dateString);
  const current_date = new Date();

  let stage = "Seconds";
  let difference = (current_date - date) / 1000;
  if (difference > 60 * 60 * 24 * 30 * 12) {
    difference = (current_date - date) / (1000 * 60 * 60 * 24 * 30 * 12);
    stage = "Years";
  } else if (difference > 60 * 60 * 24 * 30) {
    difference = (current_date - date) / (1000 * 60 * 60 * 24 * 30);
    stage = "Months";
  } else if (difference > 60 * 60 * 24) {
    difference = (current_date - date) / (1000 * 60 * 60 * 24);
    stage = "Days";
  } else if (difference > 60 * 60) {
    difference = (current_date - date) / (1000 * 60 * 60);
    stage = "Hours";
  } else if (difference > 60) {
    difference = (current_date - date) / (1000 * 60);
    stage = "Minutes";
  }

  return `${Math.ceil(difference)} ${stage} Ago`;
}
