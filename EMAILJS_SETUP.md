# EmailJS Setup

To make the contact form send emails:

1. Go to https://www.emailjs.com and create a free account
2. Add an **Email Service** (Gmail, Outlook, etc.) — copy the **Service ID**
3. Create an **Email Template** with these variables:
   - `{{from_name}}` — sender name
   - `{{from_email}}` — sender email
   - `{{phone}}` — phone number
   - `{{service}}` — service requested
   - `{{subject}}` — message subject
   - `{{message}}` — message body
   Copy the **Template ID**
4. Go to Account > API Keys — copy your **Public Key**

5. Open `src/components/Contact.jsx` and replace the top constants:
   ```js
   const EMAILJS_SERVICE_ID = 'your_service_id'
   const EMAILJS_TEMPLATE_ID = 'your_template_id'
   const EMAILJS_PUBLIC_KEY = 'your_public_key'
   ```

Free tier: 200 emails/month.
