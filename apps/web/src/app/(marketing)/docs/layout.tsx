import { DocsSidebar } from "@/components/marketing/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-page min-h-screen bg-black">
      <DocsSidebar />
      <main className="lg:ml-56 min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:px-8 lg:px-16">
          <article className="docs-content">
            {children}
          </article>
        </div>
      </main>

      {/* Docs-specific typography styles */}
      <style>{`
        .docs-content h1 {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        .docs-content h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: white;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          scroll-margin-top: 5rem;
        }
        .docs-content h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #e5e5e5;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .docs-content p {
          color: #a1a1aa;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .docs-content a:not([class]) {
          color: #39FF14;
          text-decoration: none;
        }
        .docs-content a:not([class]):hover {
          text-decoration: underline;
        }
        .docs-content strong {
          color: white;
          font-weight: 600;
        }
        .docs-content code:not(pre code) {
          background: rgba(255,255,255,0.06);
          color: #39FF14;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .docs-content ul, .docs-content ol {
          margin-bottom: 1rem;
          padding-left: 1.25rem;
        }
        .docs-content ul { list-style: disc; }
        .docs-content ol { list-style: decimal; }
        .docs-content li {
          color: #a1a1aa;
          line-height: 1.75;
          margin-bottom: 0.25rem;
        }
        .docs-content li strong {
          color: white;
        }
        .docs-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 2rem 0;
        }

        /* Tables */
        .docs-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.85rem;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .docs-content thead {
          background: rgba(255,255,255,0.04);
        }
        .docs-content th {
          color: #d4d4d8;
          font-weight: 600;
          text-align: left;
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .docs-content td {
          color: #a1a1aa;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .docs-content tbody tr:nth-child(even) {
          background: rgba(255,255,255,0.015);
        }
        .docs-content tbody tr:hover {
          background: rgba(255,255,255,0.03);
        }
        .docs-content td code {
          font-size: 0.75rem;
        }

        /* Blockquote */
        .docs-content blockquote {
          border-left: 3px solid rgba(57,255,20,0.3);
          background: rgba(57,255,20,0.03);
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .docs-content blockquote p {
          color: #d4d4d8;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
