export class TokenCounter {
    async count(content) {
        const tokens = content.split(/\s+/).filter(token => token.length > 0);
        return tokens.length;
    }
}
