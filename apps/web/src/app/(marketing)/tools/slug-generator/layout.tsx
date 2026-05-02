import type { Metadata } from "next";
import { buildToolMetadata, buildToolJsonLd } from "../_lib/tools-seo";

export const metadata: Metadata = buildToolMetadata("slug-generator");

export default function Layout({ children }: { children: React.ReactNode }) {
  const schemas = buildToolJsonLd("slug-generator");
  return (
    <>
      {schemas && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.softwareSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faqSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumbSchema) }}
          />
        </>
      )}
      {children}
    </>
  );
}
