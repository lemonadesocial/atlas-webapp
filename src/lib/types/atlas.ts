export interface AtlasEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end?: string;
  timezone?: string;
  location?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  url?: string;
  source_platform: string;
  source_id?: string;
  category?: string;
  tags?: string[];
  min_price?: number;
  max_price?: number;
  currency?: string;
  availability?: "available" | "limited" | "sold_out";
  organizer_name?: string;
  organizer_avatar?: string;
  attendee_count?: number;
}

export interface AtlasSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  date_from?: string;
  date_to?: string;
  categories?: string;
  price_min?: number;
  price_max?: number;
  free_only?: boolean;
  source_platform?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface AtlasSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  results: AtlasSearchResultItem[];
  facets?: {
    categories?: Array<{ name: string; count: number }>;
    source_platforms?: Array<{ name: string; count: number }>;
    price_ranges?: Array<{ label: string; min: number; max: number; count: number }>;
  };
}

export interface AtlasSearchResultItem {
  event: AtlasEvent;
  relevance_score?: number;
  distance_km?: number;
  source_space_id?: string;
  source_space_name?: string;
  source_type?: string;
}

export interface AtlasEventDetail extends AtlasEvent {
  ticket_types?: TicketType[];
  source?: {
    url: string;
    platform: string;
  };
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  remaining?: number;
  max_per_order?: number;
}

export interface PurchaseHold {
  hold_id: string;
  amount: number;
  currency: string;
  payment_methods: string[];
  expires_at: string;
}

export interface CheckoutSession {
  checkout_url: string;
  expires_at: string;
}

export interface Receipt {
  status: "pending" | "completed" | "expired";
  receipt?: {
    id: string;
    event_id: string;
    tickets: Array<{
      ticket_type: string;
      attendee_name: string;
      attendee_email: string;
    }>;
  };
}
