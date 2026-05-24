import { createFileRoute } from "@tanstack/react-router";

import MediaManager from "@/pages/admin/MediaManager";

export const Route =
  createFileRoute(
    "/media-manager"
  )({
    component:
      MediaManager,
  });