// Shapes for the beehiiv V2 API responses used by this site.
// Docs: https://developers.beehiiv.com/docs/v2

export interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  created?: number;
  status?: string;
  publish_date?: number | null;
  displayed_date?: number | null;
  thumbnail_url?: string | null;
  web_url?: string;
  slug?: string;
  audience?: string;
  platform?: string;
  preview_text?: string;
  content_tags?: string[];
  content?: {
    free?: {
      web?: string;
      email?: string;
      rss?: string;
    };
    premium?: {
      web?: string;
      email?: string;
    };
  };
}

export interface BeehiivPostsResponse {
  data: BeehiivPost[];
  limit?: number;
  page?: number;
  total_results?: number;
  total_pages?: number;
}

export interface BeehiivPostResponse {
  data: BeehiivPost;
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: string;
  created?: number;
  subscription_tier?: string;
}

export interface BeehiivSubscriptionResponse {
  data: BeehiivSubscription;
}

export interface BeehiivErrorResponse {
  status?: number;
  errors?: Array<{ message?: string }>;
  message?: string;
}
