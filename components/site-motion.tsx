"use client";

import { useEffect } from "react";

const revealSelectors = [
  ".path-strip", ".pain-section", ".results-section", ".programs-section",
  ".income-section", ".specialists-section", ".reviews-section", ".consultation-section",
  ".interior-hero", ".editorial-split", ".education-list", ".science-block",
  ".book-block", ".course-facts", ".program-timeline", ".event-facts",
  ".included-block", ".contact-page-grid", ".interior-consultation", ".legal-copy",
];

const sequenceSelectors = [
  ".path-grid", ".pain-grid", ".results-grid", ".program-grid", ".income-flow",
  ".specialist-grid", ".reviews-layout", ".interior-grid", ".science-grid",
  ".course-facts", ".event-facts", ".included-block > div", ".program-timeline",
];

export function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = revealSelectors.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)));
    const sequenceTargets = sequenceSelectors.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)));

    root.classList.add("motion-ready");
    revealTargets.forEach((target) => target.classList.add("motion-reveal"));
    sequenceTargets.forEach((target) => target.classList.add("motion-sequence"));

    const targets = Array.from(new Set([...revealTargets, ...sequenceTargets]));
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return () => root.classList.remove("motion-ready");
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
