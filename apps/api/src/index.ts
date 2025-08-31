import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { convertMessages } from "@mastra/core/agent";
import { convertToModelMessages, type UIMessage } from "ai";
import { Elysia, t } from "elysia";
import { mastra } from "./providers/mastra/instance";
import { uiMessageSchema } from "./schemas";

const app = new Elysia()
	.use(cors())
	.use(swagger())
	.get("/health", () => "OK")
	.post(
		"/message",
		async ({ body }) => {
			const lastMessage = body.messages[body.messages.length - 1];
			const modelMessages = convertToModelMessages([lastMessage as UIMessage]);

			const agent = mastra.getAgent("mainAgent");

			const thread = body.threadId ?? crypto.randomUUID();

			const stream = await agent.streamVNext(modelMessages, {
				format: "aisdk",
				memory: {
					thread,
					resource: "default",
				},
			});

			return stream.toUIMessageStreamResponse();
		},
		{
			body: t.Object({
				messages: t.Array(uiMessageSchema),
				threadId: t.Optional(t.Nullable(t.String())),
			}),
		},
	)
	.get("/threads", async () => {
		const agent = mastra.getAgent("mainAgent");
		const memory = await agent.getMemory();
		const threads = await memory?.getThreadsByResourceId({
			resourceId: "default",
		});

		return threads;
	})
	.get("/threads/:id", async ({ params }) => {
		const agent = mastra.getAgent("mainAgent");
		const memory = await agent.getMemory();
		const messagesResult = await memory?.query({
			threadId: params.id,
		});

		if (!messagesResult?.messages) {
			return [];
		}

		const aiv5Messages = convertMessages(messagesResult?.messages).to(
			"AIV5.UI",
		);

		return aiv5Messages;
	})
	.listen(3000);

export type App = typeof app;

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
