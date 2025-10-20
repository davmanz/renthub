# Contributing to RentHub

Thank you for your interest in contributing to RentHub! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the project and its community.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs. actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, Docker version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why would this be useful?
- **Proposed solution** if you have one
- **Alternatives considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write clear commit messages**
4. **Include tests** for new functionality
5. **Update documentation** as needed
6. **Ensure all tests pass** before submitting

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Python 3.12+
- Node.js 22+
- pnpm (for frontend)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/davmanz/renthub.git
   cd renthub
   ```

2. **Set up environment variables**
   ```bash
   cp renthub-env/backend.env.example renthub-env/backend.env
   cp renthub-env/frontend.env.example renthub-env/frontend.env
   # Edit the .env files with your configuration
   ```

3. **Start with Docker**
   ```bash
   docker-compose build
   docker-compose up
   ```

4. **Or run manually**
   
   Backend:
   ```bash
   cd renthub-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py init_data
   python manage.py runserver
   ```

   Frontend:
   ```bash
   cd renthub-frontend
   pnpm install
   pnpm run dev
   ```

## Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Maximum line length: 120 characters
- Run linting before committing:
  ```bash
  flake8 .
  black .
  ```

### TypeScript/React (Frontend)

- Follow ESLint configuration
- Use TypeScript types (avoid `any`)
- Use functional components with hooks
- Run linting before committing:
  ```bash
  pnpm run lint
  ```

### Commit Messages

Format: `<type>(<scope>): <subject>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(auth): add password reset functionality
fix(contracts): resolve date validation issue
docs(readme): update installation instructions
```

## Testing

### Backend Tests

```bash
cd renthub-backend
python manage.py test
```

### Frontend Tests

```bash
cd renthub-frontend
pnpm test
```

## Documentation

- Update README.md for user-facing changes
- Update inline code comments for complex logic
- Update API documentation for endpoint changes
- Add docstrings for new functions/classes

## Review Process

1. All submissions require review
2. Address review feedback promptly
3. Keep changes focused and minimal
4. Squash commits before merging if requested

## Questions?

Feel free to open an issue for questions or discussion about contributing.

Thank you for contributing to RentHub!
