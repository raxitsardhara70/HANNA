export async function* streamText(
    text: string,
    delay = 20,
): AsyncGenerator<string> {

    let current = "";

    for (const character of text) {

        current += character;

        yield current;

        await new Promise(resolve => setTimeout(resolve, delay));

    }

}
