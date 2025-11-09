import { Router } from "express";
import DriverController from "../controller/driver/driver";

const DriverRouter: Router = Router();

DriverRouter.post("/create-driver", DriverController.registerDriver);
DriverRouter.get("/get-driver", DriverController.getDrivers);
DriverRouter.put("/:id/update-driver", DriverController.updateDriver);
DriverRouter.get("/dayoff", DriverController.dayOffByUser);
DriverRouter.get("/get-allDayOff", DriverController.dayOffInWeek);
DriverRouter.delete("/:id/delete-driver", DriverController.deleteDriver);

export default DriverRouter;
