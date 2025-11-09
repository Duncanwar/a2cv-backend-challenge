import express from "express";
import ManagerController from "../controller/Manager/manager";
import SubManagerController from "../controller/SubManager/subManager";

const router = express.Router();

router.get("/get-manager", SubManagerController.getSubManager);

router.post("/:id/approve-arrival", SubManagerController.approveArrival);
router.get("/get-daily-activity", ManagerController.getDailyActivity);

export default router;
