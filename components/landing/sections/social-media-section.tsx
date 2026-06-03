"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionVariant } from "@/components/landing/section-motion";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { instagramPosts } from "@/components/landing/landing-data";
import { config } from "@/lib/config";
import type { InstagramPost } from "@/types/instagram";
import { useEffect, useState } from "react";

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
              className="animate-pulse rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] aspect-square"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="group relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative aspect-square overflow-hidden">
                <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={post.image}
                    alt={post.caption}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,60,20,0.9)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </a>
              </div>
                <div className="p-4">
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-2">
                    {post.caption}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted-faded)]">
                    <div className="flex items-center gap-1">
                      <InstagramIcon />
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
          href={config.socialMedia.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-[var(--color-forest)]"
        >
          <InstagramIcon />
          Follow us on Instagram
        </a>
      </motion.div>
    </motion.section>
  );
}
