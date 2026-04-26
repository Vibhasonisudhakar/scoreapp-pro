# Make ScoreApp Public

This repository is set up for a single public URL on Render. The backend now serves the built React app from the same domain, so others can use it without any local setup.

## 1) Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a new Web Service from the repository and use the root `render.yaml`.
3. Let Render run the build and start commands from the blueprint.
4. Set these environment variables in Render:
   - `PORT=10000`
   - `JWT_SECRET=<strong_random_secret>`
   - `CORS_ORIGIN=*`
   - `MONGO_URI=<your_mongodb_connection_string>`
   - `FRONTEND_URL=<your_render_service_url>`
   - `DEMO_NAME=Demo User`
   - `DEMO_EMAIL=demo@scoreapp.com`
   - `DEMO_PASSWORD=Score123!`
   - `EXPOSE_RESET_TOKEN=false`
   - `EMAIL_PROVIDER=custom` or one of `gmail`, `resend`, `sendgrid`
   - `SMTP_HOST=<smtp_host>`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=<smtp_username>`
   - `SMTP_PASS=<smtp_password>`
   - `RESET_FROM_EMAIL=<sender_email_or_name_and_email>`
   - `RESET_BRAND_NAME=ScoreApp`
   - `RESET_SUPPORT_EMAIL=<support_email>`

Render builds the frontend during deployment, and the backend serves the compiled app from `/`.

## 2) Share the app

Share the Render service URL. Users can open it directly, register if MongoDB is connected, or use the demo login if you keep the demo env vars in place.

## 3) Forgot Password

- Reset links are built from `FRONTEND_URL`.
- Set `FRONTEND_URL` to the Render URL so emailed links return users to the hosted app.
- Keep `EXPOSE_RESET_TOKEN=false` in production.

## 4) Optional SMTP presets

Gmail:

```env
EMAIL_PROVIDER=gmail
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_16_char_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
RESET_FROM_EMAIL="ScoreApp <yourgmail@gmail.com>"
```

Resend:

```env
EMAIL_PROVIDER=resend
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxx
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
RESET_FROM_EMAIL="ScoreApp <onboarding@resend.dev>"
```

SendGrid:

```env
EMAIL_PROVIDER=sendgrid
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
RESET_FROM_EMAIL="ScoreApp <verified-sender@yourdomain.com>"
```

## 5) Local development

- Frontend: `frontendcd` with `REACT_APP_API_BASE_URL=http://localhost:5000`
- Backend: `backend` with `PORT=5005`
- The public deployment does not require Netlify.
