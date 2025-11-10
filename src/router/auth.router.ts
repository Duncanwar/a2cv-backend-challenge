import { Router } from "express";
import AuthController from "../controller/Auth/auth";
import { loginValidator, registerValidators } from "../validators/authValidator";

const AuthRouter: Router = Router();

AuthRouter.post("/login", loginValidator ,AuthController.login);
AuthRouter.post("/signup", registerValidators, AuthController.signUp);


export default AuthRouter;
