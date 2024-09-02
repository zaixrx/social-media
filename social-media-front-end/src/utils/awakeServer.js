import axios from "axios";
import cron from "cron";

export default new cron.CronJob("*/14 * * * *", () => {
  axios
    .get(process.env.REACT_APP_API_URL)
    .catch(({ message, response }) =>
      console.log(response ? response : message)
    );
});
