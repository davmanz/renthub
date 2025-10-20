# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite for backend models
- CI/CD pipeline with GitHub Actions
- Pre-commit hooks for code quality
- Environment variable templates (.env.example files)
- Complete API documentation (API.md)
- Security policy documentation (SECURITY.md)
- Contributing guidelines (CONTRIBUTING.md)
- LICENSE file (MIT)
- Dependabot configuration for automated dependency updates
- Code linting configuration (flake8, black, isort)
- ESLint configuration for frontend

### Changed
- Enhanced README.md with detailed setup instructions
- Improved Docker configuration with corrected CMD

### Fixed
- Typo in views.py: "Toekn" → "Token"
- Added SECRET_KEY validation in settings.py

### Security
- Added validation for SECRET_KEY environment variable
- Documented security best practices
- Configured rate limiting with Django Axes

## [1.0.0] - Initial Release

### Added
- User authentication and authorization with JWT
- Custom user model with role-based access (superadmin, admin, tenant)
- Contract management system
- Payment tracking and history
- Building and room management
- Laundry booking system
- Email verification for user accounts
- File upload with validation
- Django REST Framework API
- React frontend with Material UI
- Docker and Docker Compose configuration
- PostgreSQL database
- Nginx for serving frontend

### Security
- HTTPS enforcement
- CORS configuration
- Django Axes for brute-force protection
- Password validation
- JWT token authentication
- Secure file upload validation
