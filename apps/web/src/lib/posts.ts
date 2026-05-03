import type { User } from "@supabase/supabase-js";

type AuthorProfile = {
  name: string;
  handle: string;
  avatarUrl: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getAuthorProfile(user: User): AuthorProfile {
  const emailLocalPart = user.email?.split("@")[0] ?? "author";
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const rawName = typeof metadata?.full_name === "string" ? metadata.full_name : typeof metadata?.name === "string" ? metadata.name : emailLocalPart;
  const rawHandle = typeof metadata?.preferred_username === "string" ? metadata.preferred_username : emailLocalPart;

  return {
    name: rawName,
    handle: `${slugify(rawHandle) || "author"}-${user.id.slice(0, 8)}`,
    avatarUrl: typeof metadata?.avatar_url === "string" ? metadata.avatar_url : null,
  };
}
