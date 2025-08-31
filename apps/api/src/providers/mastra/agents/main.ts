import { Agent } from "@mastra/core";
import { openrouter } from "../../llm";
import { memory } from "../components";

export const mainAgent = new Agent({
	model: openrouter("openai/gpt-4.1"),
	name: "Main Agent",
	instructions: "Answer user's question",
	memory,
});
