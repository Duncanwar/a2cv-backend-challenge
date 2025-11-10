import { Router } from "express";
import AdminController from "../controller/Admin/admin";

const AdminRouter: Router = Router();

AdminRouter.get("/managers", AdminController.getManagers);

export default AdminRouter;