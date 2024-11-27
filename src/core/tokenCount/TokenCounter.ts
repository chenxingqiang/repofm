export class TokenCounter {
    public async count(content: string): Promise<number> {
        const tokens = content.split(/\s+/).filter(token => token.length > 0);
        return tokens.length;
    }
}
