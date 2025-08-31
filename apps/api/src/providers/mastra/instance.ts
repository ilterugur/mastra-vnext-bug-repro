import { Mastra } from "@mastra/core";
import { mainAgent } from "./agents/main";
import { storage } from "./components";

export const mastra = new Mastra({
	agents: { mainAgent },
	storage,
});
