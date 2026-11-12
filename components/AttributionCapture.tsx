"use client";

import { useEffect } from "react";
import { saveAttribution } from "@/lib/attribution";

/**
 * Banks a tracked-link tag the moment a visitor lands on ANY page with
 * ?video=<slug>&platform=<source> in the URL (links.thesavvyexpat.com adds
 * them). The redirect's se_link cookie already carries the tag, but cookies
 * get lost when someone taps the link inside the YouTube/Instagram app and
 * then opens the page in Safari or Chrome. The URL survives that hop, so this
 * re-plants the cookie and keeps a localStorage copy for readAttribution().
 * Renders nothing and does nothing for visitors without tags.
 */
export default function AttributionCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const video = params.get("video");
      const platform = params.get("platform");
      if (!video || !platform) return;
      saveAttribution(video, platform);
      const clean = (s: string) => s.replace(/[^\w.-]/g, "").slice(0, 64);
      const tag = `${clean(platform)}.${clean(video)}`;
      if (!tag.startsWith(".") && !tag.endsWith(".")) {
        const domain = window.location.hostname.endsWith("thesavvyexpat.com") ? "; domain=.thesavvyexpat.com" : "";
        document.cookie = `se_link=${encodeURIComponent(tag)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax; secure${domain}`;
      }
    } catch {
      // Attribution must never break a page.
    }
  }, []);
  return null;
}
