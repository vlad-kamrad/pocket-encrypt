export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "text"
  | "other";

const mimeTypeMap: Array<[regExp: RegExp, category: FileCategory]> = [
  [/^image\//, "image"],
  [/^video\//, "video"],
  [/^audio\//, "audio"],
  [/^application\/pdf$/, "pdf"],
  [/^text\//, "text"],
  [/^application\/json$/, "text"],
];

export function getFileCategory(mimeType: string): FileCategory {
  for (const [regex, category] of mimeTypeMap) {
    if (regex.test(mimeType)) {
      return category;
    }
  }

  return "other";
}
