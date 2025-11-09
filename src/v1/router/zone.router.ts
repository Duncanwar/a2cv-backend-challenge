import { Router } from "express";
import BusesController from "../controller/Zone/zone";

const ZoneRouter: Router = Router();

ZoneRouter.get("/get-zone", BusesController.getZone);
ZoneRouter.post("/create-zone", BusesController.createZone);
ZoneRouter.put("/:id/update-zone", BusesController.updateZone);
ZoneRouter.delete("/:id/delete-zone", BusesController.deleteZone);

export default ZoneRouter;
