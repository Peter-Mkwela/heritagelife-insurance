// app/system_admin/view-all-applications/page.tsx
import { Suspense } from "react";
import ViewApplicationsClient from "./ViewApplicationsClient";

export const dynamic = "force-dynamic";

export default function ViewAllApplicationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewApplicationsClient />
    </Suspense>
  );
}
