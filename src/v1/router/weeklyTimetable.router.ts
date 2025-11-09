import { Router } from "express";
import {
  generateWeeklyTimetable,
  getDailyTimetable,
  getWeeklyTimetable,
  searchDayTimetable,
} from "../controller/WeeklyTimetable/weeklyTimetable";

const weelkyTimeTableRouter: Router = Router();

weelkyTimeTableRouter.get("/assign-drivers", generateWeeklyTimetable);
weelkyTimeTableRouter.get("/get-timetable", getWeeklyTimetable);
weelkyTimeTableRouter.get("/get-timetable/daily", getDailyTimetable);
weelkyTimeTableRouter.get("/get-timetable/anyday", searchDayTimetable);

export default weelkyTimeTableRouter;
