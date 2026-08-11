"use client";

import { use } from "react";
import AdminWorkerEditor from "../../../components/admin/AdminWorkerEditor";

export default function EditWorkerPage({ params }) {
  const { id } = use(params);
  return <AdminWorkerEditor workerId={id} />;
}
