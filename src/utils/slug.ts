// utils/slug.ts
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function ensureUniqueSlug(
  baseSlug: string,
  existingSlugCheck: (slug: string) => Promise<boolean>,
  currentSlug?: string // Optional: the current slug if editing an existing item
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  // If we are editing an existing item, and the generated slug is the same as the current slug,
  // we don't need to check for uniqueness, as it's already unique (it's itself).
  if (currentSlug && slug === currentSlug) {
    return slug;
  }

  // Loop until a unique slug is found
  while (await existingSlugCheck(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}