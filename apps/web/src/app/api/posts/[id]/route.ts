import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@dev-connect/db";
import { authors } from "@dev-connect/db/authors";
import { posts } from "@dev-connect/db/posts";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const post = await db
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
    .where(eq(posts.id, id))
    .limit(1);

  const [record] = post;

  if (!record) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: record });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, id)).limit(1);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorId !== userData.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(posts).where(eq(posts.id, id));

  return new NextResponse(null, { status: 204 });
}
