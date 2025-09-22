/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import {GoogleGenAI, Type} from '@google/genai';
import {APP_DEFINITIONS_CONFIG, getSystemPrompt} from '../constants'; // Import getSystemPrompt and APP_DEFINITIONS_CONFIG
import {InteractionData} from '../types';

if (!process.env.API_KEY) {
  // This is a critical error. In a real app, you might throw or display a persistent error.
  // For this environment, logging to console is okay, but the app might not function.
  console.error(
    'API_KEY environment variable is not set. The application will not be able to connect to the Gemini API.',
  );
}

const ai = new GoogleGenAI({apiKey: process.env.API_KEY!}); // The "!" asserts API_KEY is non-null after the check.

export async function* streamAppContent(
  interactionHistory: InteractionData[],
  currentMaxHistoryLength: number, // Receive current max history length
  theme: string,
): AsyncGenerator<string, void, void> {
  const model = 'gemini-2.5-flash'; // Updated model

  if (!process.env.API_KEY) {
    yield `<div class="p-4 text-red-700 bg-red-100 rounded-lg">
      <p class="font-bold text-lg">Configuration Error</p>
      <p class="mt-2">The API_KEY is not configured. Please set the API_KEY environment variable.</p>
    </div>`;
    return;
  }

  if (interactionHistory.length === 0) {
    yield `<div class="p-4 text-orange-700 bg-orange-100 rounded-lg">
      <p class="font-bold text-lg">No interaction data provided.</p>
    </div>`;
    return;
  }

  const systemPrompt = getSystemPrompt(currentMaxHistoryLength, theme); // Generate system prompt dynamically

  const currentInteraction = interactionHistory[0];
  // pastInteractions already respects currentMaxHistoryLength due to slicing in App.tsx
  const pastInteractions = interactionHistory.slice(1);

  const currentElementName =
    currentInteraction.elementText ||
    currentInteraction.id ||
    'Unknown Element';
  let currentInteractionSummary = `Current User Interaction: Clicked on '${currentElementName}' (Type: ${currentInteraction.type || 'N/A'}, ID: ${currentInteraction.id || 'N/A'}).`;
  if (currentInteraction.value) {
    currentInteractionSummary += ` Associated value: '${currentInteraction.value.substring(0, 100)}'.`;
  }

  const currentAppDef = APP_DEFINITIONS_CONFIG.find(
    (app) => app.id === currentInteraction.appContext,
  );
  const currentAppContext = currentInteraction.appContext
    ? `Current App Context: '${currentAppDef?.name || currentInteraction.appContext}'.`
    : 'No specific app context for current interaction.';

  let historyPromptSegment = '';
  if (pastInteractions.length > 0) {
    // The number of previous interactions to mention in the prompt text.
    const numPrevInteractionsToMention =
      currentMaxHistoryLength - 1 > 0 ? currentMaxHistoryLength - 1 : 0;
    historyPromptSegment = `\n\nPrevious User Interactions (up to ${numPrevInteractionsToMention} most recent, oldest first in this list segment but chronologically before current):`;

    // Iterate over the pastInteractions array, which is already correctly sized
    pastInteractions.forEach((interaction, index) => {
      const pastElementName =
        interaction.elementText || interaction.id || 'Unknown Element';
      const appDef = APP_DEFINITIONS_CONFIG.find(
        (app) => app.id === interaction.appContext,
      );
      const appName = interaction.appContext
        ? appDef?.name || interaction.appContext
        : 'N/A';
      historyPromptSegment += `\n${index + 1}. (App: ${appName}) Clicked '${pastElementName}' (Type: ${interaction.type || 'N/A'}, ID: ${interaction.id || 'N/A'})`;
      if (interaction.value) {
        historyPromptSegment += ` with value '${interaction.value.substring(0, 50)}'`;
      }
      historyPromptSegment += '.';
    });
  }

  const fullPrompt = `${systemPrompt}

${currentInteractionSummary}
${currentAppContext}
${historyPromptSegment}

Full Context for Current Interaction (for your reference, primarily use summaries and history):
${JSON.stringify(currentInteraction, null, 1)}

Generate the HTML content for the window's content area only:`;

  try {
    const response = await ai.models.generateContentStream({
      model: model,
      contents: fullPrompt,
      // Removed thinkingConfig to use default (enabled thinking) for higher quality responses
      // as this is a general app, not a low-latency game AI.
      config: {},
    });

    for await (const chunk of response) {
      if (chunk.text) {
        // Ensure text property exists and is not empty
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Error streaming from Gemini:', error);
    let errorMessage = 'An error occurred while generating content.';
    // Check if error is an instance of Error and has a message property
    if (error instanceof Error && typeof error.message === 'string') {
      errorMessage += ` Details: ${error.message}`;
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string'
    ) {
      // Handle cases where error might be an object with a message property (like the API error object)
      errorMessage += ` Details: ${(error as any).message}`;
    } else if (typeof error === 'string') {
      errorMessage += ` Details: ${error}`;
    }

    yield `<div class="p-4 text-red-700 bg-red-100 rounded-lg">
      <p class="font-bold text-lg">Error Generating Content</p>
      <p class="mt-2">${errorMessage}</p>
      <p class="mt-1">This may be due to an API key issue, network problem, or misconfiguration. Please check the developer console for more details.</p>
    </div>`;
  }
}

// FIX: Add missing interpretVoiceCommand function
export async function interpretVoiceCommand(
  command: string,
): Promise<{action: string; appId?: string; error?: string}> {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured.');
  }
  if (!command) {
    return {action: 'unknown_command'};
  }

  const model = 'gemini-2.5-flash';
  const appList = APP_DEFINITIONS_CONFIG.map(
    (app) => `- ${app.name} (id: '${app.id}')`,
  ).join('\n');

  const systemPrompt = `You are a voice command interpreter for a simulated desktop environment called Roseglass. Your task is to parse the user's spoken command and translate it into a structured JSON command that the system can execute.

Here are the available applications and their IDs:
${appList}

Based on the user's command, you must determine the user's intent.

Possible actions are:
- "open_app": When the user wants to open a specific application.
- "close_app": When the user wants to close the currently open application.
- "go_to_desktop": When the user wants to return to the main desktop view.
- "open_parameters": When the user wants to open the settings/parameters panel.
- "unknown_command": If the command cannot be mapped to any of the above actions.

User command: "${command}"

Now, generate the JSON object representing this command.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              description: 'The action to be performed.',
            },
            appId: {
              type: Type.STRING,
              description: "The ID of the app, if action is 'open_app'.",
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error interpreting voice command with Gemini:', error);
    // In case of error, return a safe default
    return {action: 'unknown_command', error: 'Failed to interpret command.'};
  }
}
