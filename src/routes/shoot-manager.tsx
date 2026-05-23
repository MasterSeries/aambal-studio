import { createFileRoute } from "@tanstack/react-router";

import ShootManager from "@/pages/admin/ShootManager";

export const Route =
  createFileRoute(
    "/shoot-manager"
  )({
    component: ShootManager,
  });