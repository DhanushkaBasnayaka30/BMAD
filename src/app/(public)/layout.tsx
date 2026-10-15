export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="public-portal">{children}</section>;
}
