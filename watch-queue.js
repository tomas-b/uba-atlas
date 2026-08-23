// Idle until the queue changes, then prints the pending self-describing jobs and
// exits — which re-invokes the agent (background-task completion). The agent runs
// the atlas-grounding skill on each job's description, writes nodes, marks them
// done, and relaunches this watcher. No busy polling: fs.watchFile sleeps.
const fs = require("fs");
const path = require("path");
const QUEUE = path.join(__dirname, "queue.json");

const pending = () => {
  try { return JSON.parse(fs.readFileSync(QUEUE, "utf8")).filter((x) => x.status === "pending"); }
  catch { return []; }
};
function check() {
  const p = pending();
  if (p.length) { console.log("JOBS: " + p.map((j) => `${j.action || "create"}:${j.address}`).join(", ")); process.exit(0); }
}

if (!fs.existsSync(QUEUE)) fs.writeFileSync(QUEUE, "[]");
check(); // in case something is already queued
fs.watchFile(QUEUE, { interval: 700 }, check);
