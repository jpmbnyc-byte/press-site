import { createClientFromRequest } from "npm:@base44/sdk";
import { gateArticleForReader, publicArticleCard } from "../../shared/articleAccess.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function isLive(article: Record<string, unknown>) {
  return article.status === "published" || article.status === "featured";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });
  }

  try {
    const base44 = createClientFromRequest(req);
    let user: Record<string, unknown> | null = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    const body = await req.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    if (!slug) {
      return Response.json({ error: "slug is required" }, { status: 400, headers: CORS });
    }

    const all = await base44.asServiceRole.entities.Article.list("-published_at", 200);
    const articles = Array.isArray(all) ? all : [];
    const found = articles.find(
      (a: Record<string, unknown>) => a.slug === slug && isLive(a),
    );

    if (!found) {
      return Response.json({ error: "Essay not found", code: "not_found" }, {
        status: 404,
        headers: CORS,
      });
    }

    const gated = gateArticleForReader(found, user);

    const sameSeries = articles
      .filter(
        (a: Record<string, unknown>) =>
          isLive(a) &&
          a.series_label === found.series_label &&
          a.id !== found.id,
      )
      .map(publicArticleCard);

    // Best-effort view count (service role) — do not block the response on failure.
    try {
      await base44.asServiceRole.entities.Article.update(found.id, {
        view_count: (Number(found.view_count) || 0) + 1,
      });
    } catch {
      /* ignore */
    }

    return Response.json(
      {
        article: gated,
        related: sameSeries,
      },
      { headers: CORS },
    );
  } catch (error) {
    console.error("[getPressArticle]", error);
    return Response.json(
      { error: (error as Error).message || "Unable to load essay" },
      { status: 500, headers: CORS },
    );
  }
});
