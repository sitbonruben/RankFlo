import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function Heading({
  level,
  children,
  ...props
}: { level: 1 | 2 | 3 | 4 } & ComponentPropsWithoutRef<"h1">) {
  const Tag = `h${level}` as const;
  const id = typeof children === "string" ? slugify(children) : undefined;

  return (
    <Tag id={id} {...props}>
      {children}
      {id && (
        <a href={`#${id}`} className="heading-anchor" aria-hidden="true">
          #
        </a>
      )}
    </Tag>
  );
}

export const mdxComponents: MDXComponents = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,

  table: (props) => (
    <div className="table-wrapper">
      <table {...props} />
    </div>
  ),
};
