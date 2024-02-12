"use babel";

import Config from "../dist/config";

describe("Config", () => {
  it("should read config values", () => {
    atom.config.set("Hydron.read", JSON.stringify("bar"));
    expect(Config.getJson("read")).toEqual("bar");
  });

  it("should return {} for broken config", () => {
    atom.config.set("Hydron.broken", "foo");
    expect(Config.getJson("broken")).toEqual({});
  });
});
