# Send to Kindle

A web application that converts web articles to EPUB format and sends them directly to your Kindle device. Built with Express.js and TypeScript.

## Features

- Clean article extraction from web pages
- Automatic conversion to EPUB format
- Direct delivery to Kindle devices
- Simple web interface
- Local storage for Kindle email
- No server-side data retention
- Support for public web articles

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher, built with v20.17.0)
- npm (Node Package Manager)
- A Gmail account for sending emails
- A Kindle device and Kindle email address

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Critix-ai/send_to_kindle
cd send-to-kindle
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

Note: You'll need to generate an App Password for your Gmail account. Visit Google Account Settings > Security > 2-Step Verification > App Passwords to generate one.

## Development

To run the application in development mode with hot reloading:

```bash
npm run dev
```

## Production

To build and run the application in production mode:

```bash
npm run prod
```

Or build and run separately:

```bash
npm run build
npm run start
```

## Usage

1. Add your Gmail address (`GMAIL_USER` from .env) to your Kindle's approved email list in [Amazon preferences](https://www.amazon.com/hz/mycd/myx#/home/settings/payment)

2. Access the web interface at `http://localhost:3000` (or your configured PORT)

3. Enter your Kindle email address (must end with @kindle.com)

4. Paste the URL of the article you want to send

5. Click "Send" or press Enter

## API Endpoint

The application exposes one main endpoint:

`POST /send-article`

```json
{
  "url": "https://example.com/article",
  "kindleEmail": "your-kindle@kindle.com"
}
```

Response:

```json
{
  "success": true,
  "message": "Article sent to Kindle successfully",
  "title": "Article Title"
}
```

## Project Structure

```
├── src/
│   ├── app.ts           # Main application file
│   └── lib/
│       └── types.d.ts   # TypeScript declarations
├── public/
│   └── index.html       # Web interface
├── dist/                # Compiled JavaScript files
├── uploads/            # Temporary EPUB storage (auto-created)
├── package.json
├── tsconfig.json
└── .env
```

## Error Handling

The application includes comprehensive error handling for:

- Invalid URLs
- Invalid Kindle email addresses
- Article extraction failures
- EPUB conversion issues
- Email sending failures

## Security Considerations

- No user data is stored on the server
- Kindle email addresses are stored only in the user's browser `localStorage`
- Temporary EPUB files are automatically deleted after sending
- Only publicly accessible articles are supported

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project uses the following open-source libraries:

- [@lesjoursfr/html-to-epub](https://github.com/lesjoursfr/html-to-epub) for EPUB conversion
- [@mozilla/readability](https://github.com/mozilla/readability) for article extraction
- [Express](https://expressjs.com/) for the web server
- [TypeScript](https://www.typescriptlang.org/) for type safety

---

Created by [CritixLabs](https://critixlabs.fi)
