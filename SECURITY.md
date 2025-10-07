# Security Policy

> **Note:** This is an unofficial, personal open-source project that is not affiliated with, endorsed by, or supported by Gearset. Security issues with this MCP server should be reported here, not to Gearset.

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | ✅ |
| 1.0.x   | ✅ |
| 0.1.x   | ❌ |

## Reporting a Vulnerability

We take the security of this community MCP server seriously. If you discover a security vulnerability, please follow these steps:

### For Security Issues

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please:

1. **Email**: Send details to jared@apollo.io with the subject "Security Vulnerability - Gearset MCP Server"
2. **Include**: 
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (if you have them)

### What to Expect

- **Response Time**: We aim to respond within 48 hours
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We'll work on a fix and coordinate disclosure timing with you
- **Credit**: We'll acknowledge your contribution (if desired)

## Security Considerations

### API Token Security

- **Never commit** Gearset API tokens to version control
- Store tokens in environment variables only
- Use secure secret management in production
- Rotate tokens regularly

### Network Security

- All API communications use HTTPS
- No sensitive data is logged
- Rate limiting respects Gearset's API limits

### Dependencies

- We regularly update dependencies
- Automated security scanning via GitHub Dependabot
- Monitor for known vulnerabilities

## Best Practices for Users

### Environment Variables
```bash
# Good
export GEARSET_API_TOKEN="your_secure_token"

# Bad - never do this
git commit -m "Added API token: abc123..."
```

### MCP Configuration
```json
{
  "mcpServers": {
    "gearset": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "GEARSET_API_TOKEN": "your_secure_token"
      }
    }
  }
}
```

### Network Access
- Run in trusted environments only
- Consider firewall rules for production deployments
- Monitor API usage in Gearset dashboard

## Vulnerability Disclosure Process

1. **Private Report**: Vulnerability reported privately
2. **Assessment**: We assess impact and severity
3. **Fix Development**: Develop and test fix
4. **Coordinated Disclosure**: 
   - Security advisory published
   - Fix released
   - Public disclosure (if appropriate)

## Security Updates

- Security fixes are prioritized and released quickly
- Follow our [releases](https://github.com/jaredbt/gearset-mcp-server/releases) for updates
- Subscribe to repository notifications for security announcements

Thank you for helping keep the Gearset MCP Server secure!