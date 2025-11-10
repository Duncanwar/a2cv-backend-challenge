import express from "express";
import SubManagerController from "../controller/SubManager/subManager";

const router = express.Router();
router.post("/create-submanager", SubManagerController.registerSubManager);
router.get("/get-submanager", SubManagerController.getSubManager);
router.put("/:id/update-submanager", SubManagerController.updateSubManager);
router.put("/:id/delete-submanager", SubManagerController.deleteSubManager);

export default router;
