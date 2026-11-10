// Playwright global setup: clears today's /check counters in the LOCAL rescue database only,
// so repeated test runs don't hit the daily cap.
import pg from "pg";

export default async function resetCheckCounters() {
  const db = new pg.Client({ connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres" });
  try {
    await db.connect();
    await db.query("delete from public.check_usage; delete from public.check_global;");
  } catch (e) {
    console.warn("could not reset check counters:", e.message);
  } finally {
    await db.end().catch(() => {});
  }
}
