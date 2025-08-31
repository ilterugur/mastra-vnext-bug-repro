import { t } from "elysia";

// Ortak base schema'lar
const providerMetadataSchema = t.Object({
	providerMetadata: t.Optional(t.Any({ description: "Provider metadata" })),
});

const streamingStateSchema = t.Object({
	state: t.Optional(
		t.Union([t.Literal("streaming"), t.Literal("done")], {
			description: "Streaming state",
		}),
	),
});

const toolBaseSchema = t.Object({
	type: t.String({ pattern: "^tool-", description: "Tool type (tool-{name})" }),
	toolCallId: t.String({ description: "Tool call ID" }),
});

const dynamicToolBaseSchema = t.Object({
	type: t.Literal("dynamic-tool"),
	toolName: t.String({ description: "Tool name" }),
	toolCallId: t.String({ description: "Tool call ID" }),
});

const toolInputSchema = t.Object({
	input: t.Any({ description: "Tool input" }),
});

const partialToolInputSchema = t.Object({
	input: t.Optional(t.Any({ description: "Partial tool input" })),
});

const toolOutputSchema = t.Object({
	output: t.Any({ description: "Tool output" }),
});

const toolErrorSchema = t.Object({
	errorText: t.String({ description: "Error text" }),
});

const toolProviderExecutedSchema = t.Object({
	providerExecuted: t.Optional(t.Boolean({ description: "Provider executed" })),
});

const toolCallProviderMetadataSchema = t.Object({
	callProviderMetadata: t.Optional(
		t.Any({ description: "Call provider metadata" }),
	),
});

const toolPreliminarySchema = t.Object({
	preliminary: t.Optional(t.Boolean({ description: "Preliminary result" })),
});

const textUIPartSchema = t.Composite([
	t.Object({
		type: t.Literal("text"),
		text: t.String({ description: "Text content" }),
	}),
	streamingStateSchema,
	providerMetadataSchema,
]);

const reasoningUIPartSchema = t.Composite([
	t.Object({
		type: t.Literal("reasoning"),
		text: t.String({ description: "Reasoning text content" }),
	}),
	streamingStateSchema,
	providerMetadataSchema,
]);

const sourceUrlUIPartSchema = t.Composite([
	t.Object({
		type: t.Literal("source-url"),
		sourceId: t.String({ description: "Source ID" }),
		url: t.String({ description: "Source URL" }),
		title: t.Optional(t.String({ description: "URL title" })),
	}),
	providerMetadataSchema,
]);

const sourceDocumentUIPartSchema = t.Composite([
	t.Object({
		type: t.Literal("source-document"),
		sourceId: t.String({ description: "Source ID" }),
		mediaType: t.String({ description: "Media type" }),
		title: t.String({ description: "Document title" }),
		filename: t.Optional(t.String({ description: "Filename" })),
	}),
	providerMetadataSchema,
]);

const fileUIPartSchema = t.Composite([
	t.Object({
		type: t.Literal("file"),
		mediaType: t.String({ description: "MIME type" }),
		filename: t.Optional(t.String({ description: "Filename" })),
		url: t.String({ description: "File URL" }),
	}),
	providerMetadataSchema,
]);

// Tool UI Part Schema - AI SDK ToolUIPart tipine göre (discriminated union by state)
const toolUIPartSchema = t.Union(
	[
		// input-streaming state
		t.Composite([
			toolBaseSchema,
			t.Object({ state: t.Literal("input-streaming") }),
			partialToolInputSchema,
			toolProviderExecutedSchema,
		]),
		// input-available state
		t.Composite([
			toolBaseSchema,
			t.Object({ state: t.Literal("input-available") }),
			toolInputSchema,
			toolProviderExecutedSchema,
			toolCallProviderMetadataSchema,
		]),
		// output-available state
		t.Composite([
			toolBaseSchema,
			t.Object({ state: t.Literal("output-available") }),
			toolInputSchema,
			toolOutputSchema,
			toolProviderExecutedSchema,
			toolCallProviderMetadataSchema,
			toolPreliminarySchema,
		]),
		// output-error state
		t.Composite([
			toolBaseSchema,
			t.Object({
				state: t.Literal("output-error"),
				input: t.Optional(
					t.Any({ description: "Tool input (may be undefined for errors)" }),
				),
				rawInput: t.Optional(
					t.Any({ description: "Raw input for error cases" }),
				),
			}),
			toolErrorSchema,
			toolProviderExecutedSchema,
			toolCallProviderMetadataSchema,
		]),
	],
	{ description: "Tool UI Part discriminated union by state" },
);

// Dynamic Tool UI Part Schema - AI SDK DynamicToolUIPart tipine göre (discriminated union by state)
const dynamicToolUIPartSchema = t.Union(
	[
		// input-streaming state
		t.Composite([
			dynamicToolBaseSchema,
			t.Object({ state: t.Literal("input-streaming") }),
			partialToolInputSchema,
		]),
		// input-available state
		t.Composite([
			dynamicToolBaseSchema,
			t.Object({ state: t.Literal("input-available") }),
			toolInputSchema,
			toolCallProviderMetadataSchema,
		]),
		// output-available state
		t.Composite([
			dynamicToolBaseSchema,
			t.Object({ state: t.Literal("output-available") }),
			toolInputSchema,
			toolOutputSchema,
			toolCallProviderMetadataSchema,
			toolPreliminarySchema,
		]),
		// output-error state
		t.Composite([
			dynamicToolBaseSchema,
			t.Object({ state: t.Literal("output-error") }),
			toolInputSchema,
			toolErrorSchema,
			toolCallProviderMetadataSchema,
		]),
	],
	{ description: "Dynamic Tool UI Part discriminated union by state" },
);

const dataUIPartSchema = t.Object({
	type: t.String({ pattern: "^data-", description: "Data type (data-{name})" }),
	id: t.Optional(t.String({ description: "Data ID" })),
	data: t.Any({ description: "Data content" }),
});

// UIMessagePart union schema - AI SDK UIMessagePart tipine göre
const uiMessagePartSchema = t.Union(
	[
		textUIPartSchema,
		reasoningUIPartSchema,
		toolUIPartSchema,
		dynamicToolUIPartSchema,
		sourceUrlUIPartSchema,
		sourceDocumentUIPartSchema,
		fileUIPartSchema,
		dataUIPartSchema,
		t.Object({
			type: t.Literal("step-start"),
		}),
	],
	{
		description: "UI Message part union",
	},
);

// UIMessage schema - AI SDK UIMessage tipine uygun
export const uiMessageSchema = t.Composite([
	t.Object({
		id: t.String({ description: "Message ID" }),
		role: t.Union(
			[t.Literal("system"), t.Literal("user"), t.Literal("assistant")],
			{
				description: "Message sender type",
			},
		),
	}),
	t.Object({
		parts: t.Array(uiMessagePartSchema, {
			description: "Message parts array",
		}),
	}),
	t.Object({
		metadata: t.Optional(
			t.Any({
				description: "Message metadata",
			}),
		),
	}),
]);
