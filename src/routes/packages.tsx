import { createFileRoute } from "@tanstack/react-router";
import { PackagesShowcase } from "@/components/PackagesShowcase";

export const Route = createFileRoute("/packages")({
  component: PackagesPage,
});

function PackagesPage() {
  return (
    <div>
      <PackagesShowcase />
    </div>
  );
}