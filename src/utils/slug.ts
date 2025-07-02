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
  currentSlug?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  
  if (currentSlug && slug === currentSlug) {
    return slug;
  }

  
  while (await existingSlugCheck(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}