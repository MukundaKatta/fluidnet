import { describe, it, expect } from "vitest";
import { Fluidnet } from "../src/core.js";
describe("Fluidnet", () => {
  it("init", () => { expect(new Fluidnet().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Fluidnet(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Fluidnet(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
