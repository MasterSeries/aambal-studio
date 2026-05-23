import { createFileRoute } from "@tanstack/react-router";

import AdminShootEditor from "@/pages/admin/AdminShootEditor";

export const Route =
  createFileRoute(
    "/admin/shoot-editor"
  )({
    component: Page,
  });

function Page() {
  return <AdminShootEditor />;
}