import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const avatar_url = "https://api.dicebear.com/9.x/glass/svg";
export const generateRandomAvatar = (seed: string) => `${avatar_url}?seed=${seed}`;
