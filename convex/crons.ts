import { cronJobs } from "convex/server";

// Auto-deletion of messages after 72h has been disabled.
// With the Zero-Knowledge Escrow (ZKE) system, the private RSA key is now
// recoverable from the server — so persistent E2EE messages are safe long-term.
// Messages remain end-to-end encrypted at rest; they are simply no longer
// pruned automatically.
// To re-enable, uncomment the block below and import `internal` from "./_generated/api".

const crons = cronJobs();

// crons.interval(
// 	"auto-delete-old-messages",
// 	{ hours: 6 },
// 	internal.friends.deleteOldMessages,
// 	{},
// );

export default crons;
