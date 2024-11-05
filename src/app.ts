import express, { NextFunction, Request, Response } from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import sanitizeFilename from "sanitize-filename";
import { EpubOptions, EPub } from "@lesjoursfr/html-to-epub";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const config: EmailTransporterConfig = {
  gmailUser: process.env.GMAIL_USER || "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword,
  },
});

async function extractArticle(url: string): Promise<ArticleContent> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Could not parse article content");
    }

    return {
      title: article.title,
      author: article.byline || "Unknown",
      content: article.content,
      siteName: article.siteName || "",
      excerpt: article.excerpt || "",
      originalUrl: url,
      byline: article.byline,
    };
  } catch (error) {
    console.error("Error extracting article:", error);
    throw error;
  }
}

// Convert article to EPUB
async function createEpub(article: ArticleContent): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = sanitizeFilename(`${article.title}_${timestamp}`);
    const epubPath = path.join("uploads", `${filename}.epub`);

    // Ensure the uploads directory exists
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    const content = `
   
    ${article.byline ? `<p class="author">By ${article.byline}</p>` : ""}
    <p class="source">From: ${article.siteName || "Unknown Source"}</p>
    <p class="date">Saved on: ${new Date().toLocaleString()}</p>
    <p class="url">Original URL: <a href="${article.originalUrl}">${
      article.originalUrl
    }</a></p>
    <hr>
    ${article.content}
  `;

    const options: EpubOptions = {
      title: article.title,
      author: article.author,
      description: article.excerpt,
      publisher: article.siteName || "Web Article",
      content: [
        {
          title: article.title,
          data: content,
        },
      ],
      css: `
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      h1 { font-size: 1.8em; margin-bottom: 0.5em; }
      .author, .source, .date, .url { 
        color: #666; 
        font-size: 0.9em; 
        margin: 0.3em 0; 
      }
      hr { margin: 1em 0; }
      img { max-width: 100%; height: auto; }
    `,
      verbose: false,
    };

    const epub = new EPub(options, epubPath);
    await epub.render();
    return epubPath;
  } catch (error: any) {
    console.error("Error creating EPUB:", error);
    throw new Error(error.message || "Error creating EPUB");
  }
}

async function sendToKindle(
  epubPath: string,
  title: string,
  kindleEmail: string,
): Promise<void> {
  const mailOptions = {
    from: config.gmailUser,
    to: kindleEmail,
    subject: title,
    text: `Article: ${title}\n\nSent to your Kindle`,
    attachments: [
      {
        filename: path.basename(epubPath),
        path: epubPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } finally {
    if (fs.existsSync(epubPath)) {
      fs.unlinkSync(epubPath);
    }
  }
}

app.post(
  "/send-article",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { url, kindleEmail } = req.body;

    if (!url) {
      res.status(400).json({ error: "No URL provided" });
    }
    if (!kindleEmail) {
      res.status(400).json({ error: "No Kindle email provided" });
    }
    if (!kindleEmail.endsWith("@kindle.com")) {
      res.status(400).json({ error: "Invalid Kindle email address" });
    }

    try {
      const article = await extractArticle(url);
      const epubPath = await createEpub(article);
      await sendToKindle(epubPath, article.title, kindleEmail);

      res.json({
        success: true,
        message: "Article sent to Kindle successfully",
        title: article.title,
      });
    } catch (error) {
      console.error("Error processing article:", error);

      next(error);
    }
  },
);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Page doesn't exist" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
