import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@dev-connect/db";
import { authors } from "@dev-connect/db/authors";
import { posts } from "@dev-connect/db/posts";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthorProfile } from "@/lib/posts";

type CreatePostBody = {
  text?: string;
  media?: string[];
};

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as CreatePostBody | null;

    if (!body?.text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const profile = getAuthorProfile(userData.user);

    await db
      .insert(authors)
      .values({
        id: userData.user.id,
        name: profile.name,
        handle: profile.handle,
        avatarUrl: profile.avatarUrl,
      })
      .onConflictDoUpdate({
        target: authors.id,
        set: {
          name: profile.name,
          handle: profile.handle,
          avatarUrl: profile.avatarUrl,
        },
      });

    const [createdPost] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        authorId: userData.user.id,
        text: body.text.trim(),
        media: Array.isArray(body.media) ? body.media.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [],
      })
      .returning();

    if (!createdPost) {
      return NextResponse.json({ error: "Post insert failed" }, { status: 500 });
    }

    const [post] = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        text: posts.text,
        media: posts.media,
        views: posts.views,
        reposts: posts.reposts,
        reactions: posts.reactions,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          handle: authors.handle,
          avatarUrl: authors.avatarUrl,
        },
      })
      .from(posts)
      .innerJoin(authors, eq(posts.authorId, authors.id))
      .where(eq(posts.id, createdPost.id))
      .limit(1);

    return NextResponse.json(
      { post },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
