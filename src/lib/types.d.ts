interface ArticleContent {
  title: string;
  author: string;
  content: string;
  siteName: string;
  excerpt: string;
  originalUrl: string;
  byline?: string;
}

interface RequestBody {
  url: string;
  kindleEmail: string;
}

interface EmailTransporterConfig {
  gmailUser: string;
  gmailAppPassword: string;
}
