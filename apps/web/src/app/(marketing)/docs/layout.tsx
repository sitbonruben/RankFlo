import { DocsSidebar } from "@/components/marketing/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <DocsSidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:px-12">
          <article className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-p:text-gray-400 prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-accent prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-li:text-gray-400 prose-table:text-sm prose-th:text-gray-300 prose-td:text-gray-400 prose-hr:border-gray-800">
            {children}
          </article>
        </div>
      </main>
    </div>
  );
}
