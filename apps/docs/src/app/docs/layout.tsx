import { Sidebar } from "@/components/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main style={{ marginLeft: 280 }} className="flex-1 min-w-0">
        <div className="mx-auto max-w-[720px] px-8 py-16 sm:px-12 lg:px-16">
          <article className="prose-custom">{children}</article>
        </div>
      </main>
    </div>
  );
}
