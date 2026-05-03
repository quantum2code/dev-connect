"use client";

import { Button } from "@dev-connect/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dev-connect/ui/components/card";
import { Input } from "@dev-connect/ui/components/input";
import { Label } from "@dev-connect/ui/components/label";
import * as React from "react";

type PostRecord = {
  id: string;
  authorId: string;
  text: string;
  media: string[];
  views: number;
  reposts: number;
  reactions: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string | null;
  };
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseApiResponse(raw: string) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { post?: PostRecord; error?: string };
  } catch {
    return { error: raw };
  }
}

export function PostLab({ email }: { email: string }) {
  const [createText, setCreateText] = React.useState("Hello from the post lab");
  const [createMedia, setCreateMedia] = React.useState("");
  const [postId, setPostId] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [post, setPost] = React.useState<PostRecord | null>(null);

  async function requestPost(id: string) {
    const response = await fetch(`/api/posts/${id}`);
    const raw = await response.text();
    const data = parseApiResponse(raw);

    if (!response.ok) {
      throw new Error(data?.error ?? raw ?? "Failed to load post");
    }

    return data?.post ?? null;
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: createText,
          media: createMedia
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const raw = await response.text();
      const data = parseApiResponse(raw);

      if (!response.ok) {
        throw new Error(data?.error ?? raw ?? "Failed to create post");
      }

      setPost(data?.post ?? null);
      setPostId(data?.post?.id ?? "");
      setStatus("Post created");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoad() {
    if (!postId.trim()) {
      setError("Enter a post ID first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const record = await requestPost(postId.trim());
      setPost(record);
      setStatus(record ? "Post loaded" : "No post returned");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!postId.trim()) {
      setError("Enter a post ID first");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/posts/${postId.trim()}`, { method: "DELETE" });

      if (!response.ok && response.status !== 204) {
        const raw = await response.text();
        const data = raw ? parseApiResponse(raw) : null;
        throw new Error(data?.error ?? raw ?? "Failed to delete post");
      }

      setPost(null);
      setStatus("Post deleted");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Post Lab</CardTitle>
          <CardDescription>Create a post, then load or delete it by ID.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-xs text-muted-foreground">Signed in as {email}</p>
          <form className="grid gap-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="post-text">Text</Label>
              <textarea
                id="post-text"
                className="min-h-28 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                value={createText}
                onChange={(event) => setCreateText(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-media">Media URLs</Label>
              <Input
                id="post-media"
                value={createMedia}
                onChange={(event) => setCreateMedia(event.target.value)}
                placeholder="https://... , https://..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              Create post
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Tester</CardTitle>
          <CardDescription>Use the post ID to fetch or delete via the API.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-id">Post ID</Label>
            <Input id="post-id" value={postId} onChange={(event) => setPostId(event.target.value)} placeholder="uuid" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleLoad} disabled={loading}>
              Load post
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete post
            </Button>
          </div>
          {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <pre className="overflow-auto rounded-none border border-border bg-muted p-3 text-[11px] leading-relaxed">
            {formatJson(post)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
