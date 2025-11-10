import cron from "node-cron";
import { prisma } from "../../config/database";
import { Response as ExpressResponse, Request, NextFunction } from "express";
import Response from "../../services/response";

export async function generateWeeklyTimetable() {
  const today = new Date();
  const dayIndex = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const buses = await prisma.bus.findMany();
  const drivers = await prisma.driver.findMany({ include: { user: true } });

  if (buses.length === 0 || drivers.length < 7) {
    console.error("❌ Not enough buses or drivers to proceed.");
    return;
  }

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const driverLeaveMap = new Map();
  for (const driver of sortedDrivers) {
    let leaveDay;
    do {
      leaveDay = weekDays[Math.floor(Math.random() * weekDays.length)];
    } while (driverLeaveMap.has(leaveDay));
    driverLeaveMap.set(driver.userId, leaveDay);

    const leaveDate = new Date(startOfWeek);
    leaveDate.setDate(startOfWeek.getDate() + weekDays.indexOf(leaveDay));

    await prisma.leaveSchedule.upsert({
      where: { driverId_startOfWeek: { driverId: driver.userId, startOfWeek } },
      update: { leaveDate },
      create: { driverId: driver.userId, startOfWeek, endOfWeek, leaveDate },
    });
  }

  const assignments = [];
  const groupSize = 6;
  for (let i = 0; i < 7; i++) {
    const dayOfWeek = weekDays[i];
    const assignedDrivers = new Set();

    for (let j = 0; j < buses.length; j += groupSize) {
      const busGroup = buses.slice(j, j + groupSize);
      const driverGroup = sortedDrivers.slice(j, j + 7);

      for (let k = 0; k < busGroup.length; k++) {
        const bus = busGroup[k];
        const driver = driverGroup.find(
          (d) =>
            driverLeaveMap.get(d.userId) !== dayOfWeek &&
            !assignedDrivers.has(d.userId)
        );

        if (!driver) continue;

        assignedDrivers.add(driver.userId);

        assignments.push({
          busId: bus.id,
          driverId: driver.userId,
          startOfWeek,
          endOfWeek,
          dayOfWeek,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  await prisma.weelkyTimeTableActivity.createMany({ data: assignments });

  console.log(
    `✅ Weekly timetable generated from ${startOfWeek.toDateString()} to ${endOfWeek.toDateString()}`
  );
}

cron.schedule("0 4 * * * ", async () => {
  console.log("🚀 Generating weekly timetable...");
  await generateWeeklyTimetable();
});

export async function getWeeklyTimetable(
  req: Request,
  res: ExpressResponse,
  next: NextFunction
): Promise<ExpressResponse | void> {
  const today = new Date();
  const dayIndex = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const timetable = await prisma.weelkyTimeTableActivity.findMany({
    where: {
      startOfWeek: { gte: startOfWeek },
      endOfWeek: { lte: endOfWeek },
    },
    include: { bus: true, driver: true },
  });
  return Response.send(res, 200, "Weekly Timetable", timetable);
}
export async function getDailyTimetable(
  req: Request,
  res: ExpressResponse,
  next: NextFunction
): Promise<ExpressResponse | void> {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = daysOfWeek[new Date().getDay()];
  const timetable = await prisma.weelkyTimeTableActivity.findMany({
    where: { dayOfWeek: today },
    include: {
      bus: true,
      driver: true,
    },
  });
  return Response.send(res, 201, "Timetable for Today", timetable);
}
export async function searchDayTimetable(
  req: Request,
  res: ExpressResponse,
  next: NextFunction
): Promise<ExpressResponse | void> {
  const day = req.query.day as string;
  console.log(req.query);
  const today = new Date();
  const dayIndex = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const timetable = await prisma.weelkyTimeTableActivity.findMany({
    where: {
      startOfWeek: { gte: startOfWeek },
      dayOfWeek: day,
      endOfWeek: { lte: endOfWeek },
    },
    include: { bus: true, driver: true },
  });
  return Response.send(res, 200, "Weekly Timetable", timetable);
}
