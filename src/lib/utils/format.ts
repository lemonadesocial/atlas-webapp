export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatPrice(
  amount: number | undefined,
  currency?: string
): string {
  if (amount === undefined || amount === null) return "Free";
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceRange(
  min?: number,
  max?: number,
  currency?: string
): string {
  if ((min === undefined || min === 0) && (max === undefined || max === 0)) {
    return "Free";
  }
  if (min !== undefined && max !== undefined && min !== max) {
    return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
  }
  return formatPrice(min ?? max, currency);
}

export function getDateRange(filter: string): {
  date_from?: string;
  date_to?: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today": {
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      return {
        date_from: today.toISOString(),
        date_to: end.toISOString(),
      };
    }
    case "weekend": {
      const dayOfWeek = today.getDay();
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - dayOfWeek));
      const monday = new Date(saturday);
      monday.setDate(saturday.getDate() + 2);
      return {
        date_from: saturday.toISOString(),
        date_to: monday.toISOString(),
      };
    }
    case "week": {
      const end = new Date(today);
      end.setDate(today.getDate() + 7);
      return {
        date_from: today.toISOString(),
        date_to: end.toISOString(),
      };
    }
    case "month": {
      const end = new Date(today);
      end.setMonth(today.getMonth() + 1);
      return {
        date_from: today.toISOString(),
        date_to: end.toISOString(),
      };
    }
    default:
      return {};
  }
}

export function timeUntil(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
