import { Router } from "express";
import AuthController from "../controller/Auth/auth";

const AuthRouter: Router = Router();

AuthRouter.post("/login", AuthController.login);

export default AuthRouter;
