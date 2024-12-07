import os from 'node:os';
import path from 'node:path';
export const getGlobalDirectory = () => {
    if (process.platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
        return path.join(localAppData, 'repofm');
    }
    if (process.env.XDG_CONFIG_HOME) {
        return path.join(process.env.XDG_CONFIG_HOME, 'repofm');
    }
    return path.join(os.homedir(), '.config', 'repofm');
};
//# sourceMappingURL=globalDirectory.js.map