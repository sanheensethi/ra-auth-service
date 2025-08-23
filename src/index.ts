import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from 'body-parser';
import { config } from "./config/v1/config";
import UserController from "./controllers/v1/user.controller";
import { routeHandler } from "./middleware/v1/routeHandler";


const app = express();

app.use(helmet());
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());


const userController = new UserController();

app.use(routeHandler);

app.use('/auth/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'User Management Service is running' });
});

app.use('/auth/api/v1', userController.getRouter());

app.listen(config.port, () => {
  console.log(`auth service listening on :${config.port}`);
});
