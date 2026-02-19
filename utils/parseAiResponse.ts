export function parseAiJsonResponse(response: string): any {
    // Remove markdown code blocks (```json or ``` or ```javascript)
    const jsonMatch = response.match(/```(?:json|javascript)?\s*\n?([\s\S]*?)\n?```/);

    let jsonString: string;

    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
    } else {
        // If no code block found, try parsing the entire response
        jsonString = response.trim();
    }

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error(`Failed to parse JSON from AI response: ${error.message}`);
    }
}

