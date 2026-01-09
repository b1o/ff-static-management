import { twMerge } from 'tailwind-merge';

export type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const flatten = (arr: ClassValue[]): string[] =>
    arr.flatMap((v) => (Array.isArray(v) ? flatten(v) : v)).filter(Boolean) as string[];
  return twMerge(flatten(inputs).join(' '));
}

export const discordAvatarUrl = (discordId: string, avatar: string, size = 128) => {
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=${size}`;
};
export const discordDefaultAvatarUrl = (discriminator: string, size = 128) => {
  const defaultAvatarNumber = parseInt(discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png?size=${size}`;
};
export const getUserAvatarUrl = (
  discordId: string,
  avatar: string | null,
  discriminator: string,
  size = 128
) => {
  if (avatar) {
    return discordAvatarUrl(discordId, avatar, size);
  } else {
    return discordDefaultAvatarUrl(discriminator, size);
  }
};
