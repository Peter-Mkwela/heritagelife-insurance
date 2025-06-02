// app/system_admin/view-all-applications/page.tsx
'use client';
import ViewApplicationsClient from "./ViewApplicationsClient";

export const dynamic = "force-dynamic";

export default function ViewAllApplicationsPage() {
  return <ViewApplicationsClient />;
}
