"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionVariant } from "@/components/landing/section-motion";
import { instagramPosts } from "@/components/landing/landing-data";
import { useEffect, useState } from "react";

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  date: string;
  permalink: string;
}

export function SocialMediaSection() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  useEffect(() => {
    async function fetchInstagramPosts() {
      try {
        const response = await fetch("/api/instagram/posts?limit=3");
        const data = await response.json();

        if (data.success) {
          setPosts(data.posts);
          setUsingCache(data.cached || false);
          setError(null);
        } else {
          throw new Error(data.error || "Failed to fetch posts");
        }
      } catch (err) {
        console.error("Instagram fetch error:", err);
        // Fall back to static data
        setPosts(instagramPosts);
        setError("Using static data - Instagram API unavailable");
      } finally {
        setLoading(false);
      }
    }

    fetchInstagramPosts();
  }, []);

  return (
    <motion.section
      id="social-media"
      className="space-y-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <SectionHeading
        label="Follow Us"
        title="Stay connected on Instagram"
        description="Discover our latest collections, behind-the-scenes glimpses, and artisan stories."
      />

      {error && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-200">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-[rgba(189,188,178,0.2)] bg-[rgba(44,60,20,0.7)] aspect-square"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="group relative overflow-hidden rounded-3xl border border-[rgba(189,188,178,0.2)] bg-[rgba(44,60,20,0.7)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative aspect-square overflow-hidden">
                <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,60,20,0.9)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </a>
              </div>
              <div className="p-4">
                <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-2">
                  {post.caption}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-[rgba(189,188,178,0.65)]">
                  <div className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>{post.likes.toLocaleString()} likes</span>
                  </div>
                  <span>{post.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <a
          href="https://www.instagram.com/your-handmade-bags"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-[var(--color-forest)]"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          Follow us on Instagram
        </a>
      </motion.div>
    </motion.section>
  );
}
