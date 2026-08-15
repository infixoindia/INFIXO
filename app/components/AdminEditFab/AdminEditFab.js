import Link from "next/link";

// A tiny floating "Edit" pill shown ONLY when this public page was opened
// from the admin panel's "Open Live Public Profile" link (via ?admin=<id>).
// Regular visitors never see this — it's just a fast way back into editing.
export default function AdminEditFab({ workerId }) {
  if (!workerId) return null;

  return (
    <Link
      href={`/admin/workers/${workerId}`}
      style={{
        position: "fixed",
        bottom: "18px",
        right: "18px",
        zIndex: 999,
        background: "#2563eb",
        color: "#fff",
        padding: "0.55rem 1rem",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
      }}
    >
      ✏️ Edit
    </Link>
  );
}
