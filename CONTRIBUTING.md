# Contribution Guide

Thanks for your interest in **repofm**! 🚀 We’d love your help to make it even better. Here’s how you can get involved:

- **Create an Issue**: Spot a bug? Have an idea for a new feature? Let us know by creating an issue.
- **Submit a Pull Request**: Found something to fix or improve? Jump in and submit a PR!
- **Spread the Word**: Share your experience with repofm on social media, blogs, or with your tech community.
- **Use repofm**: The best feedback comes from real-world usage, so feel free to integrate repofm into your own projects!

## Maintainers

repofm is maintained by Yamadashy ([@chenxingqiang](https://github.com/chenxingqiang)). While all contributions are welcome, please understand that not every suggestion may be accepted if they don't align with the project's goals or coding standards.

---

## Pull Requests

Before submitting a Pull Request, please ensure:

1. Your code passes all tests: Run `npm run test`
2. Your code adheres to our linting standards: Run `npm run lint`
3. You have updated relevant documentation (especially README.md) if you've added or changed functionality.

## Local Development

To set up repofm for local development:

```bash
git clone https://github.com/chenxingqiang/repofm.git
cd repofm
npm install
```

To run repofm locally:

```bash
npm run cli-run
```

### Coding Style

We use [Biome](https://biomejs.dev/) for linting and formatting. Please make sure your code follows the style guide by running:

```bash
npm run lint
```

### Testing

We use [Vitest](https://vitest.dev/) for testing. To run the tests:

```bash
npm run test
```

For test coverage:

```bash
npm run test-coverage
```

### Documentation

When adding new features or making changes, please update the relevant documentation in the README.md file.

## Releasing

New versions are managed by the maintainer. If you think a release is needed, open an issue to discuss it

Thank you for contributing to repofm!
