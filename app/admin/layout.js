import AdminActivity from "./AdminActivity";

export default function AdminLayout({ children }) {
  return (
    <>
      {children}
      <AdminActivity />
    </>
  );
}
