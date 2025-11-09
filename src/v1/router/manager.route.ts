import express from "express";
import ManagerController from "../controller/Manager/manager";

const router = express.Router();
router.post("/create-manager", ManagerController.registerManager);

router.post(
  "/daily-activity/start-car-wash",

  ManagerController.startCarWash
);
router.get("/get-manager", ManagerController.getManager);

router.post("/daily-activity/:id/end-car-wash", ManagerController.endCarWash);
router.get("/get-submanager", ManagerController.getManager);
router.put("/:id/update-submanager", ManagerController.updateManager);
router.put("/:id/delete-submanager", ManagerController.deleteManager);
router.get("/daily-activity", ManagerController.getDailyActivity);

export default router;
