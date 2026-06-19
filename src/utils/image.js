/**
 * Helper to resolve and construct complete event image URLs.
 * Handles absolute URLs, relative file paths, and provides gorgeous placeholders.
 */
export function getEventImageUrl(image) {
  if (!image) {
    return null;
  }

  const strImage = String(image).trim();

  // If it's already an absolute URL, return it as-is
  if (strImage.startsWith("http://") || strImage.startsWith("https://")) {
    return strImage;
  }

  // Strip any leading uploads path variations that might be stored in DB
  let filename = strImage;
  if (filename.startsWith("uploads/events/")) {
    filename = filename.replace("uploads/events/", "");
  } else if (filename.startsWith("/uploads/events/")) {
    filename = filename.replace("/uploads/events/", "");
  } else if (filename.startsWith("/")) {
    filename = filename.substring(1);
  }

  // Prepend the remote uploads base directory
  return `https://ticketii.com.ng/ticketii/uploads/events/${filename}`;
}

/**
 * Returns a gorgeous fallback placeholder image from Unsplash
 * depending on an event identifier (to keep placeholders consistent).
 */
export function getEventPlaceholderUrl(id) {
  const placeholders = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", // Tech / Concert
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80", // Music
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", // Party
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80", // Festival
  ];
  const index = Math.abs(parseInt(id, 10) || 0) % placeholders.length;
  return placeholders[index];
}
