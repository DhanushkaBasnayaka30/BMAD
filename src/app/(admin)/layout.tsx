export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="admin-portal">{children}</section>;
}
