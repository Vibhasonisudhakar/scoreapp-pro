# ScoreApp Mini Frontend

React frontend for the mini ScoreApp.

## Features

- Login and register UI
- Forgot password and reset password UI (email reset link supported)
- Token-based authentication
- Protected dashboard with scoring workflow
- Scenario and distribution reports

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure API base URL in `.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

3. Start app:

```bash
npm start
```

Frontend runs at `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deployment

Use Netlify with:
- Base directory: `frontendcd`
- Build command: `npm run build`
- Publish directory: `build`
- Environment variable: `REACT_APP_API_BASE_URL=<backend_url>`

## Email Provider Selector (Backend)

Choose one provider for forgot-password emails in backend environment variables:

- Gmail:
	- `EMAIL_PROVIDER=gmail`
	- `SMTP_USER=<your_gmail_address>`
	- `SMTP_PASS=<gmail_app_password>`
- Resend:
	- `EMAIL_PROVIDER=resend`
	- `SMTP_USER=resend`
	- `SMTP_PASS=<resend_api_key>`
- SendGrid:
	- `EMAIL_PROVIDER=sendgrid`
	- `SMTP_USER=apikey`
	- `SMTP_PASS=<sendgrid_api_key>`

For full copy-paste env blocks, see root deployment guide.

See root deployment guide in `PUBLIC_DEPLOYMENT.md` for full backend + frontend steps.
