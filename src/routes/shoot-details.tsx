import { createFileRoute } from "@tanstack/react-router";

import ShootDetails from "@/pages/ShootDetails";

export const Route =
  createFileRoute(
    "/shoot-details"
  )({
    component: ShootDetails,
  });