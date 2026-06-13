import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
	"auto-delete-old-messages",
	{ hours: 6 },
	internal.friends.deleteOldMessages,
	{},
);

export default crons;
