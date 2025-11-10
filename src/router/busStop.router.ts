import { Router } from "express";
import BusStopController from "../controller/BusStop/busStop";

const BusStopRouter: Router = Router();

BusStopRouter.get("/get-busStop", BusStopController.getBusStop);
BusStopRouter.post("/create-busStop", BusStopController.createBusStop);
BusStopRouter.put("/:id/update-busStop", BusStopController.updateBusStop);
BusStopRouter.delete("/:id/delete-busStop", BusStopController.deleteBusStop);

export default BusStopRouter;
