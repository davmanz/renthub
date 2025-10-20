# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within RentHub, please send an email to the project maintainers. All security vulnerabilities will be promptly addressed.

Please do not publicly disclose the issue until it has been addressed by the team.

## Security Measures

### Backend Security

1. **Authentication & Authorization**
   - JWT-based authentication using `djangorestframework-simplejwt`
   - Role-based access control (superadmin, admin, tenant)
   - Password validation with Django's built-in validators

2. **Rate Limiting**
   - Django Axes for brute-force protection
   - Configurable failure limits and cooloff periods
   - IP-based and username-based lockout

3. **CORS Configuration**
   - Restricted to frontend URL only
   - Credentials allowed for authenticated requests

4. **HTTPS Enforcement**
   - SSL redirect enabled in production
   - Secure proxy SSL header configuration

5. **File Upload Security**
   - File type validation (only jpg, jpeg, png, gif)
   - Maximum file size limit (5MB)
   - Unique filename generation using UUID

### Frontend Security

1. **Token Storage**
   - JWT tokens stored in localStorage
   - Automatic token refresh mechanism
   - Tokens cleared on 401 responses

2. **API Communication**
   - HTTPS-only in production
   - Authorization headers for authenticated requests

### Environment Variables

Never commit sensitive information to the repository:
- Use `.env.example` files as templates
- Keep actual `.env` files in `.gitignore`
- Rotate credentials regularly

### Docker Security

1. **Non-root Users**
   - Backend runs as `renthub` user
   - Frontend runs as `nginx` user

2. **Resource Limits**
   - CPU and memory limits configured
   - Prevents resource exhaustion attacks

3. **Health Checks**
   - Regular health checks for all services
   - Automatic restart on failure

## Best Practices

1. **Keep Dependencies Updated**
   - Regularly update Python and Node.js packages
   - Monitor security advisories

2. **Secure Deployment**
   - Always use HTTPS in production
   - Keep SECRET_KEY secret and unique
   - Use strong database passwords
   - Disable DEBUG in production

3. **Data Protection**
   - Regular database backups
   - Encrypted communication
   - Secure file storage

## Compliance

This application handles personal data and should be deployed with consideration for:
- GDPR (if operating in EU)
- Local data protection laws
- Privacy regulations applicable to your jurisdiction
