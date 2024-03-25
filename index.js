import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
//set directory dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });
import express from "express";
import initApp from "./src/index.router.js";
const app = express();
// setup port and the baseUrl
const port = process.env.PORT || 5000;
import schedule from "node-schedule";
import sendEmail from "./src/utils/email.js";
import userModel from "./DB/model/User.model.js";
let send = async function () {
  const users = await userModel.find({ confirmEmail: false });
  if (users) {
    for (let user of users) {
      sendEmail({
        to: user.email,
        subject: ` confirm email`,
        html: `please confirm your email because will delete your your email if does not it `,
      });
    }
  }
};
const job = schedule.scheduleJob("0 0 21 * * *", send);
initApp(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
