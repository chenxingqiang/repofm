// src/features/autoCommit/fileTypes.js
export const fileTypePatterns = {
    // Frontend patterns
    react: {
        pattern: /\.(jsx|tsx)$/,
        folders: ['components', 'pages', 'features'],
        keywords: ['useState', 'useEffect', 'Component'],
        scope: 'ui'
    },
    vue: {
        pattern: /\.(vue)$/,
        folders: ['components', 'views'],
        keywords: ['template', 'script', 'style'],
        scope: 'ui'
    },
    angular: {
        pattern: /\.(component|directive|service|pipe)\.ts$/,
        folders: ['app'],
        keywords: ['@Component', '@Injectable'],
        scope: 'ui'
    },
    style: {
        pattern: /\.(css|scss|less|sass|styl)$/,
        folders: ['styles', 'assets'],
        scope: 'style'
    },

    // Backend patterns
    controller: {
        pattern: /controller\.(js|ts)$/,
        folders: ['controllers', 'routes'],
        keywords: ['router', 'app.get', 'app.post'],
        scope: 'api'
    },
    model: {
        pattern: /model\.(js|ts)$/,
        folders: ['models', 'entities'],
        keywords: ['schema', 'Entity', '@Column'],
        scope: 'db'
    },
    service: {
        pattern: /service\.(js|ts)$/,
        folders: ['services'],
        keywords: ['@Service', 'Injectable'],
        scope: 'service'
    },

    // Test patterns
    unitTest: {
        pattern: /\.(spec|test)\.(js|ts|jsx|tsx)$/,
        folders: ['__tests__', 'test'],
        keywords: ['describe', 'it', 'test'],
        scope: 'test'
    },
    e2eTest: {
        pattern: /\.e2e-spec\.(js|ts)$/,
        folders: ['e2e', 'cypress'],
        keywords: ['cy.visit', 'browser.get'],
        scope: 'test'
    },

    // Config patterns
    config: {
        pattern: /\.(config|conf|rc)\.(js|json|yaml|yml)$/,
        folders: ['config'],
        scope: 'config'
    },
    buildConfig: {
        pattern: /(webpack|rollup|vite|babel)\.config\./,
        scope: 'build'
    },

    // Documentation patterns
    docs: {
        pattern: /\.(md|mdx|markdown|rst|txt)$/,
        folders: ['docs', 'documentation'],
        scope: 'docs'
    },
    api: {
        pattern: /\.(swagger|openapi)\.(json|yaml|yml)$/,
        folders: ['api'],
        scope: 'api'
    }
}
