export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const CATEGORY_COLORS: Record<string, string> = {
  Antibiotic: "bg-red-500/10 text-red-400 border-red-500/20",
  Vitamin: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Calcium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Gastric: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Painkiller: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Antihypertensive: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Antidiabetic: "bg-green-500/10 text-green-400 border-green-500/20",
  Antihistamine: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};
