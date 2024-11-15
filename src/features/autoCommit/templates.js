// src/features/autoCommit/templates.js
export const commitTemplates = {
    // Feature related templates
    feature: {
        add: 'feat({}): add {} functionality',
        update: 'feat({}): update {} implementation',
        enhance: 'feat({}): enhance {} capabilities',
        implement: 'feat({}): implement {}',
        optimize: 'perf({}): optimize {} performance'
    },

    // Bug fix templates
    fix: {
        bug: 'fix({}): resolve {} issue',
        security: 'fix({}): address security vulnerability in {}',
        typo: 'fix({}): correct typo in {}',
        regression: 'fix({}): fix regression in {}',
        edge: 'fix({}): handle edge case in {}'
    },

    // Documentation templates
    docs: {
        add: 'docs({}): add documentation for {}',
        update: 'docs({}): update {} documentation',
        example: 'docs({}): add examples for {}',
        api: 'docs(api): update {} API documentation',
        comment: 'docs({}): improve code comments in {}'
    },

    // Style templates
    style: {
        format: 'style({}): format {}',
        improve: 'style({}): improve {} styling',
        responsive: 'style({}): enhance responsiveness of {}',
        theme: 'style(theme): update {} theme',
        layout: 'style(layout): adjust {} layout'
    },

    // Refactor templates
    refactor: {
        improve: 'refactor({}): improve {} structure',
        simplify: 'refactor({}): simplify {} logic',
        split: 'refactor({}): split {} into smaller components',
        merge: 'refactor({}): merge {} components',
        cleanup: 'refactor({}): clean up {}'
    },

    // Test templates
    test: {
        add: 'test({}): add tests for {}',
        update: 'test({}): update {} tests',
        coverage: 'test({}): improve test coverage for {}',
        unit: 'test(unit): add unit tests for {}',
        integration: 'test(integration): add integration tests for {}'
    },

    // Build templates
    build: {
        deps: 'build(deps): update dependencies for {}',
        config: 'build({}): update build configuration',
        bundle: 'build({}): optimize bundle size',
        pipeline: 'build(ci): update CI pipeline for {}'
    },

    // Chore templates
    chore: {
        deps: 'chore(deps): update {} dependencies',
        cleanup: 'chore({}): clean up {}',
        version: 'chore(release): bump {} version',
        merge: 'chore(merge): merge {} into {}',
        config: 'chore(config): update {} configuration'
    }
}
