import { Router } from "express";
import { authenticate } from "../middleware/authHandler";
import ErrorHandler from "../middleware/errorHandler";
import AuthRouter from "./auth.router";
import DriverRoute from "./driver.router";
import BusesRoute from "./buses.router";
import BusStopRoute from "./busStop.router";
import WeeklyTimetable from "./weeklyTimetable.router";
import ManagerRoute from "./manager.route";
import SubManagerRoute from "./subManager.route";
import DailyRoute from "./dailyActivity";
import ZoneRoute from "./zone.router";
import isManager from "../middleware/isManager";
import isSubManager from "../middleware/isSubManager";
import AdminRouter from "./admin.router";
import isAdmin from "../middleware/isAdmin";

const router: Router = Router();

router.use("/auth", ErrorHandler.watch(AuthRouter));
router.use("/driver", [authenticate], ErrorHandler.watch(DriverRoute));
router.use("/buses", authenticate, ErrorHandler.watch(BusesRoute));
router.use("/busStop", authenticate, ErrorHandler.watch(BusStopRoute));
router.use("/weekly", authenticate, ErrorHandler.watch(WeeklyTimetable));
router.use(
  "/manager",
  [authenticate, isManager],
  ErrorHandler.watch(ManagerRoute)
);
router.use(
  "/submanager",
  [authenticate, isAdmin],
  ErrorHandler.watch(SubManagerRoute)
);
router.use(
  "/daily",
  [authenticate, isSubManager],
  ErrorHandler.watch(DailyRoute)
);
router.use("/zone", [authenticate], ErrorHandler.watch(ZoneRoute));

router.use("/admin", [authenticate, isAdmin], ErrorHandler.watch(AdminRouter));

router.all("/*", ErrorHandler.notFound);

export default router;
