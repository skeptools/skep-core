export function toSlug(raw: string): string {
  return raw.toLowerCase().replace(/'/g, '').replace(/\W/g, '_');
}

export function toKebabSlug(raw: string): string {
  return toSlug(raw).replace(/_/g, '-');
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

export function appendIf(str: string | undefined, suffix: string): string {
  if (str) {
    return `${str}${suffix}`;
  } else {
    return '';
  }
}
