class TokenCounter {
    countTokens(text: string): number {
        const tokens = text.split(/\s+/);
        return tokens.length;
    }
    // ... other methods and properties of the class ...
}
