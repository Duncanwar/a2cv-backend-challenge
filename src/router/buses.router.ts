import { Router } from "express";
import BusesController from "../controller/buses/buses";

const BusesRouter: Router = Router();

BusesRouter.get("/get-buses", BusesController.getBuses);
BusesRouter.post("/create-buses", BusesController.createBus);
BusesRouter.put("/:id/update-buses", BusesController.updateBus);
BusesRouter.delete("/:id/delete-buses", BusesController.deleteBus);

export default BusesRouter;
