"use client";

import { useEffect } from "react";

const RELOAD_KEY = "zeroslate_css_recovery_reloaded";

export default function CssRecovery() {
  useEffect(() => {
    const reveal = () => {
      document.documentElement.classList.remove("zeroslate-css-pending");
      document.documentElement.classList.add("zeroslate-css-ready");
    };

    const timeout = window.setTimeout(() => {
      const probe = document.createElement("div");
      probe.className = "hidden";
      probe.setAttribute("aria-hidden", "true");
      document.body.appendChild(probe);

      const cssLoaded = window.getComputedStyle(probe).display === "none";
      probe.remove();

      if (cssLoaded) {
        sessionStorage.removeItem(RELOAD_KEY);
        reveal();
        return;
      }

      if (sessionStorage.getItem(RELOAD_KEY) === "true") {
        reveal();
        return;
      }

      sessionStorage.setItem(RELOAD_KEY, "true");
      window.location.reload();
    }, 50);

    return () => window.clearTimeout(timeout);
  }, []);

  return null;
}
