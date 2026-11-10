import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Results } from "./results";

// Reads the measured results if they exist. No file (or a bad one) means "Not measured yet":
// the report never shows a number that didn't come from a real run.
export async function readResults(): Promise<Results | null> {
  const file = process.env.RESULTS_PATH ?? path.join(process.cwd(), "content", "results.json");
  try {
    return Results.parse(JSON.parse(await readFile(file, "utf8")));
  } catch {
    return null;
  }
}
