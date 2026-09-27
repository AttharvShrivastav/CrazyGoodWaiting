"use client";

import { preload } from "react-dom";

export function PreloadResources() {
  preload("/fonts/MonumentExtended-Ultrabold.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return null;
}
