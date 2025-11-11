import { Router } from "express";
import AuthController from "../controller/Auth/auth";
import { loginValidator, registerValidators } from "../validators/authValidator";

const AuthRouter: Router = Router();

AuthRouter.post("/register", registerValidators, AuthController.signUp);
AuthRouter.post("/login", loginValidator ,AuthController.login);


export default AuthRouter;
