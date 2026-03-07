"use client";

import type {
  EditorBlock,
  HeroBlockProps,
  HeadingBlockProps,
  TextBlockProps,
  ImageBlockProps,
  QuoteBlockProps,
  CodeBlockProps,
  CalloutBlockProps,
  DividerBlockProps,
  TwoColumnBlockProps,
  ListBlockProps,
  EmbedBlockProps,
  TableOfContentsBlockProps,
  NewsletterCtaBlockProps,
  AuthorBioBlockProps,
} from "@rankflo/core/types";

import { HeroBlock } from "./hero-block";
import { HeadingBlock } from "./heading-block";
import { TextBlock } from "./text-block";
import { ImageBlock } from "./image-block";
import { QuoteBlock } from "./quote-block";
import { CodeBlock } from "./code-block";
import { CalloutBlock } from "./callout-block";
import { DividerBlock } from "./divider-block";
import { TwoColumnBlock } from "./two-column-block";
import { ListBlock } from "./list-block";
import { EmbedBlock } from "./embed-block";
import { TableOfContentsBlock } from "./table-of-contents-block";
import { NewsletterCtaBlock } from "./newsletter-cta-block";
import { AuthorBioBlock } from "./author-bio-block";

// ─── Props ──────────────────────────────────────────────
interface BlockRendererProps {
  block: EditorBlock;
  isEditing?: boolean;
}

// ─── Component ─────────────────────────────────────────
export function BlockRenderer({ block, isEditing = true }: BlockRendererProps) {
  /**
   * Render helper used by TwoColumnBlock for recursive child rendering.
   * Passes the current isEditing context through.
   */
  const renderBlock = (childBlock: EditorBlock) => (
    <BlockRenderer block={childBlock} isEditing={isEditing} />
  );

  switch (block.type) {
    case "hero":
      return (
        <HeroBlock
          id={block.id}
          props={block.props as HeroBlockProps}
        />
      );

    case "heading":
      return (
        <HeadingBlock
          id={block.id}
          props={block.props as HeadingBlockProps}
        />
      );

    case "text":
      return (
        <TextBlock
          id={block.id}
          props={block.props as TextBlockProps}
        />
      );

    case "image":
      return (
        <ImageBlock
          id={block.id}
          props={block.props as ImageBlockProps}
        />
      );

    case "quote":
      return (
        <QuoteBlock
          id={block.id}
          props={block.props as QuoteBlockProps}
        />
      );

    case "code":
      return (
        <CodeBlock
          id={block.id}
          props={block.props as CodeBlockProps}
        />
      );

    case "callout":
      return (
        <CalloutBlock
          id={block.id}
          props={block.props as CalloutBlockProps}
        />
      );

    case "divider":
      return (
        <DividerBlock
          id={block.id}
          props={block.props as DividerBlockProps}
        />
      );

    case "two-column":
      return (
        <TwoColumnBlock
          id={block.id}
          props={block.props as TwoColumnBlockProps}
          renderBlock={renderBlock}
        />
      );

    case "list":
      return (
        <ListBlock
          id={block.id}
          props={block.props as ListBlockProps}
        />
      );

    case "embed":
      return (
        <EmbedBlock
          id={block.id}
          props={block.props as EmbedBlockProps}
        />
      );

    case "table-of-contents":
      return (
        <TableOfContentsBlock
          id={block.id}
          props={block.props as TableOfContentsBlockProps}
        />
      );

    case "newsletter-cta":
      return (
        <NewsletterCtaBlock
          id={block.id}
          props={block.props as NewsletterCtaBlockProps}
        />
      );

    case "author-bio":
      return (
        <AuthorBioBlock
          id={block.id}
          props={block.props as AuthorBioBlockProps}
        />
      );

    default: {
      // Exhaustive check — renders a fallback for unknown block types
      const _exhaustive: never = block.type;
      return (
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-500">
            Unknown block type: {String(_exhaustive)}
          </p>
        </div>
      );
    }
  }
}
