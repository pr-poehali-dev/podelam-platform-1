export async function shareContent({ title, text, url }: { title?: string; text?: string; url?: string }): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url: url || window.location.href });
      return true;
    }
    await navigator.clipboard.writeText(url || window.location.href);
    return true;
  } catch {
    return false;
  }
}
