-- ============================================================
-- Doxly project seed — API documentation platform
-- ============================================================

-- Project
INSERT INTO projects (id, "organizationId", name, description, url, platform, status, "brandLogo", "apiKey", "contentFormat", "postCount", "totalViews", "createdAt", "updatedAt")
VALUES (
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'Doxly',
  'API documentation platform that connects to your API and auto-generates beautiful, interactive docs for REST endpoints, webhooks, and SDK references.',
  'https://doxly.co',
  'CUSTOM',
  'ACTIVE',
  'https://app.rankflo.io/doxly-logo.png',
  'blg_d8f3a2c5b6e1f4a7d9c0b2e5f3a6d1c8b4e7f0a2d5c9b3e6f1a4d7c0b8e5f2',
  'MARKDOWN',
  10,
  0,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET "apiKey" = EXCLUDED."apiKey", "brandLogo" = EXCLUDED."brandLogo";

-- Tags
INSERT INTO tags (id, name, slug, "projectId", "organizationId", "createdAt", "updatedAt") VALUES
  ('tag_dx_apidocs',    'API Docs',           'api-docs',           'clld001doxlyproject000000', 'cmmhq0kf20001lm017xtbgefh', NOW(), NOW()),
  ('tag_dx_devtools',   'Developer Tools',    'developer-tools',    'clld001doxlyproject000000', 'cmmhq0kf20001lm017xtbgefh', NOW(), NOW()),
  ('tag_dx_webhooks',   'Webhooks',           'webhooks',           'clld001doxlyproject000000', 'cmmhq0kf20001lm017xtbgefh', NOW(), NOW()),
  ('tag_dx_openapi',    'OpenAPI',            'openapi',            'clld001doxlyproject000000', 'cmmhq0kf20001lm017xtbgefh', NOW(), NOW()),
  ('tag_dx_devex',      'Developer Experience', 'developer-experience', 'clld001doxlyproject000000', 'cmmhq0kf20001lm017xtbgefh', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- POST 1: What Is API Documentation?
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_001',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'What Is API Documentation? A Complete Guide for Developers (2026)',
  'what-is-api-documentation-complete-guide',
  'Everything developers need to know about API documentation — what it is, why it matters, and what makes the difference between docs that get adopted and docs that get ignored.',
  'PUBLISHED',
  'en',
  8,
  NOW() - INTERVAL '14 days',
  '<h2>What Is API Documentation?</h2><p>API documentation is the technical reference that tells developers how to use your API. It describes every endpoint, parameter, authentication method, response format, and error code — so developers can integrate your API without needing to contact your team.</p><p>Think of it as a contract between your API and the developers who use it. Good documentation is the difference between an API that gets adopted widely and one that gets abandoned in favor of a competitor with better docs.</p><h2>Why API Documentation Matters</h2><p>In a survey of over 2,000 developers, 83% said documentation quality was the most important factor when evaluating an API. Not price. Not features. Documentation. The reason is simple: developers are busy. If they can not figure out how to use your API in the first 30 minutes, they will try a different one.</p><p>Companies like Stripe, Twilio, and Plaid have built billion-dollar businesses partly because their documentation is exceptional. Their quickstart guides get developers to their first working integration in under 10 minutes.</p><h2>Types of API Documentation</h2><p>Modern API documentation covers several distinct areas that serve different needs:</p><ul><li><strong>Reference docs</strong> — The complete specification of every endpoint, method, parameter, and response</li><li><strong>Getting started guides</strong> — Step-by-step tutorials for building the first integration</li><li><strong>Conceptual guides</strong> — Explanations of how the API works, authentication flows, rate limiting, and error handling</li><li><strong>Changelog</strong> — A record of API changes, deprecations, and new features</li><li><strong>Webhook docs</strong> — Documentation for event-driven integrations</li><li><strong>SDK references</strong> — Documentation for official client libraries in different languages</li></ul><h2>What Makes Great API Documentation?</h2><p>The best API documentation shares five characteristics:</p><ul><li><strong>Complete</strong> — Every endpoint, parameter, and response code is documented with no gaps</li><li><strong>Accurate</strong> — The docs match the actual API behavior, with no outdated or incorrect information</li><li><strong>Practical</strong> — Real code examples in multiple languages that developers can copy and run immediately</li><li><strong>Structured</strong> — Logical organization with search, versioning, and clear navigation</li><li><strong>Maintained</strong> — Updated automatically when the API changes, never out of sync</li></ul><h2>How Doxly Automates API Documentation</h2><p>Traditional API documentation is written manually — a slow, error-prone process that quickly falls behind the actual API. Every time an endpoint changes, someone has to remember to update the docs. They often do not.</p><p>Doxly connects directly to your API and generates documentation automatically from your OpenAPI spec, code annotations, or live traffic. The result is documentation that is always up to date, always accurate, and structured to give developers the best possible experience.</p>',
  'What Is API Documentation? API documentation is the technical reference that tells developers how to use your API. It describes every endpoint, parameter, authentication method, response format, and error code. In a survey of over 2,000 developers, 83% said documentation quality was the most important factor when evaluating an API. Types include reference docs, getting started guides, conceptual guides, changelogs, webhook docs, and SDK references. Great docs are complete, accurate, practical, structured, and maintained.',
  $j1${
  "version": 1,
  "blocks": [
    {"id": "dx1b01", "type": "heading", "props": {"text": "What Is API Documentation?", "level": 2, "alignment": "left"}},
    {"id": "dx1b02", "type": "text", "props": {"html": "<p>API documentation is the technical reference that tells developers how to use your API. It describes every endpoint, parameter, authentication method, response format, and error code — so developers can integrate your API without needing to contact your team.</p><p>Think of it as a contract between your API and the developers who use it. Good documentation is the difference between an API that gets adopted widely and one that gets abandoned in favor of a competitor with better docs.</p>", "alignment": "left"}},
    {"id": "dx1b03", "type": "heading", "props": {"text": "Why API Documentation Matters", "level": 2, "alignment": "left"}},
    {"id": "dx1b04", "type": "text", "props": {"html": "<p>In a survey of over 2,000 developers, <strong>83% said documentation quality was the most important factor when evaluating an API</strong>. Not price. Not features. Documentation. The reason is simple: developers are busy. If they can not figure out how to use your API in the first 30 minutes, they will try a different one.</p><p>Companies like Stripe, Twilio, and Plaid have built billion-dollar businesses partly because their documentation is exceptional. Their quickstart guides get developers to their first working integration in under 10 minutes.</p>", "alignment": "left"}},
    {"id": "dx1b05", "type": "heading", "props": {"text": "Types of API Documentation", "level": 2, "alignment": "left"}},
    {"id": "dx1b06", "type": "text", "props": {"html": "<p>Modern API documentation covers several distinct areas that serve different needs:</p>", "alignment": "left"}},
    {"id": "dx1b07", "type": "list", "props": {"items": ["Reference docs — The complete specification of every endpoint, method, parameter, and response", "Getting started guides — Step-by-step tutorials for building the first integration", "Conceptual guides — Explanations of authentication flows, rate limiting, and error handling", "Changelog — A record of API changes, deprecations, and new features", "Webhook docs — Documentation for event-driven integrations", "SDK references — Documentation for official client libraries in different languages"], "style": "bullet"}},
    {"id": "dx1b08", "type": "heading", "props": {"text": "What Makes Great API Documentation?", "level": 2, "alignment": "left"}},
    {"id": "dx1b09", "type": "list", "props": {"items": ["Complete — Every endpoint, parameter, and response code is documented with no gaps", "Accurate — The docs match actual API behavior with no outdated information", "Practical — Real code examples in multiple languages that developers can copy and run", "Structured — Logical organization with search, versioning, and clear navigation", "Maintained — Updated automatically when the API changes, never out of sync"], "style": "bullet"}},
    {"id": "dx1b10", "type": "heading", "props": {"text": "How Doxly Automates API Documentation", "level": 2, "alignment": "left"}},
    {"id": "dx1b11", "type": "text", "props": {"html": "<p>Traditional API documentation is written manually — a slow, error-prone process that quickly falls behind the actual API. Every time an endpoint changes, someone has to remember to update the docs. They often do not.</p><p>Doxly connects directly to your API and generates documentation automatically from your OpenAPI spec, code annotations, or live traffic. The result is documentation that is always up to date, always accurate, and structured to give developers the best possible experience.</p>", "alignment": "left"}},
    {"id": "dx1b12", "type": "callout", "props": {"title": "Pro Tip", "text": "The best API documentation gets developers to a working integration in under 10 minutes. If yours takes longer, your time-to-first-call metric is the most important thing to optimize.", "type": "info"}}
  ],
  "metadata": {}
}$j1$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_001', 'tag_dx_apidocs') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 2: REST API Documentation Best Practices
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_002',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'REST API Documentation Best Practices: 12 Rules Top APIs Follow',
  'rest-api-documentation-best-practices',
  'The 12 documentation practices that separate world-class APIs like Stripe and Twilio from APIs that developers give up on. Concrete, actionable rules with real examples.',
  'PUBLISHED',
  'en',
  10,
  NOW() - INTERVAL '12 days',
  '<h2>Why Most REST API Docs Fail</h2><p>Most API documentation fails developers at the same predictable points: vague parameter descriptions, missing error codes, code examples that do not work, and reference docs that are out of date. The result is frustrated developers, more support tickets, and lower adoption.</p><p>The best APIs in the world — Stripe, Twilio, GitHub, Shopify — have all invested heavily in documentation quality. Here are the 12 rules they follow.</p><h2>Rule 1: Document Every Endpoint Completely</h2><p>Every REST endpoint needs: HTTP method and full URL, all path parameters with types and descriptions, all query parameters with defaults, the complete request body schema, all possible response schemas (success and error), authentication requirements, and at least one working code example.</p><h2>Rule 2: Use Real, Working Code Examples</h2><p>Code examples are the most important part of any API reference. Developers copy them directly. That means your examples must be syntactically correct, use real (or realistic) values, show both request and response, and work immediately when pasted into a terminal or IDE.</p><h2>Rule 3: Document All Error Codes</h2><p>Documenting only the happy path is a common mistake. Developers spend most of their debugging time dealing with errors. Every error code needs: the HTTP status, a machine-readable error code string, a human-readable message, and — most importantly — what the developer should do to fix it.</p><h2>Rule 4: Write a Great Getting Started Guide</h2><p>Your reference documentation should be supported by a getting started guide that gets developers to their first successful API call in under 10 minutes. This guide should require no setup beyond an API key, show one complete and useful action, and explain what just happened and what to do next.</p><h2>Rule 5: Keep Docs in Sync with the API</h2><p>Outdated documentation is worse than no documentation. It wastes developer time and destroys trust. Automate this: generate docs from your OpenAPI spec, use doc tests that fail when the API changes, and make updating docs part of your PR process for every API change.</p>',
  'REST API documentation best practices from top APIs like Stripe and Twilio. Key rules: document every endpoint completely, use real working code examples, document all error codes, write a great getting started guide, and keep docs in sync with the API automatically.',
  $j2${
  "version": 1,
  "blocks": [
    {"id": "dx2b01", "type": "heading", "props": {"text": "Why Most REST API Docs Fail", "level": 2, "alignment": "left"}},
    {"id": "dx2b02", "type": "text", "props": {"html": "<p>Most API documentation fails developers at the same predictable points: vague parameter descriptions, missing error codes, code examples that do not work, and reference docs that are out of date. The result is frustrated developers, more support tickets, and lower adoption.</p><p>The best APIs in the world — Stripe, Twilio, GitHub, Shopify — have all invested heavily in documentation quality. Here are the 12 rules they follow.</p>", "alignment": "left"}},
    {"id": "dx2b03", "type": "heading", "props": {"text": "Rule 1: Document Every Endpoint Completely", "level": 2, "alignment": "left"}},
    {"id": "dx2b04", "type": "list", "props": {"items": ["HTTP method and full URL path", "All path parameters with types and descriptions", "All query parameters with defaults and allowed values", "Complete request body schema with required vs optional fields", "All possible response schemas — success and every error case", "Authentication requirements for this specific endpoint", "At least one working code example in multiple languages"], "style": "bullet"}},
    {"id": "dx2b05", "type": "heading", "props": {"text": "Rule 2: Use Real, Working Code Examples", "level": 2, "alignment": "left"}},
    {"id": "dx2b06", "type": "text", "props": {"html": "<p>Code examples are the most important part of any API reference. Developers copy them directly. That means your examples must be syntactically correct, use real values, show both request and response, and work immediately when pasted into a terminal or IDE.</p>", "alignment": "left"}},
    {"id": "dx2b07", "type": "heading", "props": {"text": "Rule 3: Document All Error Codes", "level": 2, "alignment": "left"}},
    {"id": "dx2b08", "type": "text", "props": {"html": "<p>Documenting only the happy path is a common mistake. Every error code needs: the HTTP status, a machine-readable error code string, a human-readable message, and — most importantly — what the developer should do to fix it.</p>", "alignment": "left"}},
    {"id": "dx2b09", "type": "heading", "props": {"text": "Rule 4: Write a Great Getting Started Guide", "level": 2, "alignment": "left"}},
    {"id": "dx2b10", "type": "text", "props": {"html": "<p>Your reference documentation should be supported by a getting started guide that gets developers to their first successful API call in under 10 minutes. This guide should require no setup beyond an API key, show one complete and useful action, and explain what just happened and what to do next.</p>", "alignment": "left"}},
    {"id": "dx2b11", "type": "heading", "props": {"text": "Rule 5: Keep Docs in Sync with the API", "level": 2, "alignment": "left"}},
    {"id": "dx2b12", "type": "text", "props": {"html": "<p>Outdated documentation is worse than no documentation. It wastes developer time and destroys trust. Automate this: generate docs from your OpenAPI spec, use doc tests that fail when the API changes, and make updating docs a required step in your PR process for every API change.</p>", "alignment": "left"}},
    {"id": "dx2b13", "type": "callout", "props": {"title": "The Golden Rule", "text": "If a developer has to read your source code to understand how to use your API, your documentation has failed.", "type": "warning"}}
  ],
  "metadata": {}
}$j2$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_002', 'tag_dx_apidocs') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 3: Webhook Documentation Guide
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_003',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'Webhook Documentation: How to Document Events and Payloads Clearly',
  'webhook-documentation-guide',
  'Webhooks are notoriously hard to document. This guide covers every element of great webhook docs — event catalogs, payload schemas, retry logic, security verification, and testing guides.',
  'PUBLISHED',
  'en',
  9,
  NOW() - INTERVAL '10 days',
  '<h2>Why Webhook Documentation Is Uniquely Hard</h2><p>Webhooks are fundamentally different from REST APIs. Instead of developers calling your API, your API calls their server. This inversion creates documentation challenges that standard API reference docs do not solve: developers need to know what events you send, when you send them, exactly what the payload looks like, how to verify the request came from you, and what happens if their server is down when you send the event.</p><h2>The Webhook Event Catalog</h2><p>The foundation of good webhook documentation is a complete event catalog — a list of every event type your system can emit. For each event type, document: the event name (e.g. payment.completed), when this event is triggered, the full payload schema with all fields, example payloads with real-looking data, and which subscription plans or account types can receive this event.</p><h2>Documenting Webhook Payloads</h2><p>Every webhook payload should be documented with a complete JSON schema showing every field, its type, whether it is required or optional, and what it means. Never show just a partial payload — developers will assume the example is complete and be confused when they receive additional fields.</p><h2>Security: Verifying Webhook Signatures</h2><p>This is where most webhook documentation fails. You must document how developers can verify that a webhook came from your servers and not from an attacker. Cover: the signing secret and where to find it, the signature header name and format, the exact algorithm for computing the expected signature, and a complete code example in every language you support.</p><h2>Retry Logic and Delivery Guarantees</h2><p>Developers integrating webhooks need to know what to expect when things go wrong. Document your retry schedule (e.g. immediate retry, then after 5 minutes, 30 minutes, 2 hours, 24 hours), how many total attempts you make, what HTTP status codes you consider a success, and whether you guarantee at-least-once or exactly-once delivery.</p>',
  'Webhook documentation guide. Webhooks require documenting event catalogs, payload schemas, security verification signatures, retry logic and delivery guarantees. Cover every event type, show complete payloads, and provide code examples for signature verification in every supported language.',
  $j3${
  "version": 1,
  "blocks": [
    {"id": "dx3b01", "type": "heading", "props": {"text": "Why Webhook Documentation Is Uniquely Hard", "level": 2, "alignment": "left"}},
    {"id": "dx3b02", "type": "text", "props": {"html": "<p>Webhooks are fundamentally different from REST APIs. Instead of developers calling your API, your API calls their server. This inversion creates documentation challenges that standard API reference docs do not solve: developers need to know what events you send, when you send them, exactly what the payload looks like, how to verify the request came from you, and what happens if their server is down.</p>", "alignment": "left"}},
    {"id": "dx3b03", "type": "heading", "props": {"text": "The Webhook Event Catalog", "level": 2, "alignment": "left"}},
    {"id": "dx3b04", "type": "text", "props": {"html": "<p>The foundation of good webhook documentation is a complete event catalog — a list of every event type your system can emit. For each event type, document:</p>", "alignment": "left"}},
    {"id": "dx3b05", "type": "list", "props": {"items": ["The event name (e.g. payment.completed, user.created)", "When exactly this event is triggered", "The full payload schema with all fields and types", "Example payloads with realistic data (not just placeholder values)", "Which subscription plans or account types can receive this event"], "style": "bullet"}},
    {"id": "dx3b06", "type": "heading", "props": {"text": "Security: Verifying Webhook Signatures", "level": 2, "alignment": "left"}},
    {"id": "dx3b07", "type": "text", "props": {"html": "<p>This is where most webhook documentation fails. You must document how developers can verify that a webhook came from your servers and not from an attacker. Cover:</p>", "alignment": "left"}},
    {"id": "dx3b08", "type": "list", "props": {"items": ["The signing secret and where to find it in the dashboard", "The signature header name and exact format", "The algorithm for computing the expected signature (HMAC-SHA256, etc.)", "A complete working code example in every language you support", "What to do when verification fails — reject the request, log it, alert"], "style": "bullet"}},
    {"id": "dx3b09", "type": "heading", "props": {"text": "Retry Logic and Delivery Guarantees", "level": 2, "alignment": "left"}},
    {"id": "dx3b10", "type": "text", "props": {"html": "<p>Developers integrating webhooks need to know what to expect when things go wrong. Document your retry schedule (e.g. immediate, then 5 minutes, 30 minutes, 2 hours, 24 hours), how many total attempts you make, what HTTP status codes you consider a success, and whether you guarantee at-least-once or exactly-once delivery.</p>", "alignment": "left"}},
    {"id": "dx3b11", "type": "callout", "props": {"title": "Critical", "text": "Always document that webhook endpoints must respond within your timeout window (typically 5-30 seconds). Developers who process events synchronously will hit timeouts and trigger unnecessary retries.", "type": "warning"}}
  ],
  "metadata": {}
}$j3$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_003', 'tag_dx_webhooks') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 4: OpenAPI Specification Guide
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_004',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'OpenAPI Specification Guide: Write Your First API Spec in 30 Minutes',
  'openapi-specification-guide-write-first-api-spec',
  'A practical guide to writing OpenAPI 3.1 specifications from scratch. Covers the essential structure, schema definitions, authentication, and how to generate docs automatically from your spec.',
  'PUBLISHED',
  'en',
  11,
  NOW() - INTERVAL '8 days',
  '<h2>What Is the OpenAPI Specification?</h2><p>The OpenAPI Specification (formerly Swagger) is the industry standard for describing REST APIs in a machine-readable format. An OpenAPI spec is a YAML or JSON file that completely describes your API — every endpoint, parameter, request body, response schema, and authentication method.</p><p>Once you have an OpenAPI spec, you can automatically generate interactive documentation, client SDKs in any language, server stubs, test suites, and API mocking. It is the single source of truth for your API.</p><h2>The Basic Structure of an OpenAPI 3.1 Spec</h2><p>Every OpenAPI document has the same top-level structure: openapi version, info section (title, version, description), servers list, paths (your endpoints), components (reusable schemas), and security definitions. The paths section is where your endpoint definitions live.</p><h2>Defining Your First Endpoint</h2><p>Each path in your spec maps a URL pattern to one or more HTTP operations. A well-defined endpoint includes: a summary and description, operation ID (used for SDK method names), parameters, request body schema, response schemas for each status code, and security requirements.</p><h2>Using Components for Reusable Schemas</h2><p>The components section lets you define schemas once and reference them across your spec. Instead of repeating the same User object definition in 20 different endpoints, define it once in components/schemas/User and reference it with $ref. This keeps your spec DRY and your generated docs consistent.</p><h2>Generating Docs from Your OpenAPI Spec with Doxly</h2><p>Once you have an OpenAPI spec, Doxly can import it and generate a full documentation site automatically. Doxly adds interactive try-it consoles, code samples in multiple languages, search, versioning, and a developer-friendly layout — all from your spec file. Connect your CI/CD pipeline and your docs update every time your spec changes.</p>',
  'OpenAPI Specification guide for REST APIs. OpenAPI is the industry standard for describing APIs in machine-readable YAML or JSON. Structure includes openapi version, info, servers, paths, components, and security. Define endpoints with parameters, request bodies, and response schemas. Use components for reusable schemas. Generate interactive docs automatically from your spec.',
  $j4${
  "version": 1,
  "blocks": [
    {"id": "dx4b01", "type": "heading", "props": {"text": "What Is the OpenAPI Specification?", "level": 2, "alignment": "left"}},
    {"id": "dx4b02", "type": "text", "props": {"html": "<p>The OpenAPI Specification (formerly Swagger) is the industry standard for describing REST APIs in a machine-readable format. An OpenAPI spec is a YAML or JSON file that completely describes your API — every endpoint, parameter, request body, response schema, and authentication method.</p><p>Once you have an OpenAPI spec, you can automatically generate interactive documentation, client SDKs in any language, server stubs, test suites, and API mocking. It is the single source of truth for your API.</p>", "alignment": "left"}},
    {"id": "dx4b03", "type": "heading", "props": {"text": "The Basic Structure of an OpenAPI 3.1 Spec", "level": 2, "alignment": "left"}},
    {"id": "dx4b04", "type": "list", "props": {"items": ["openapi: '3.1.0' — the specification version", "info — title, version, description, contact, and license", "servers — base URLs for different environments (prod, staging)", "paths — your endpoint definitions (the main section)", "components — reusable schemas, parameters, responses, security schemes", "security — global security requirements"], "style": "bullet"}},
    {"id": "dx4b05", "type": "heading", "props": {"text": "Defining Your First Endpoint", "level": 2, "alignment": "left"}},
    {"id": "dx4b06", "type": "text", "props": {"html": "<p>Each path maps a URL pattern to HTTP operations. A well-defined endpoint includes a summary and description, operationId (used for SDK method names), parameters, requestBody schema, response schemas for each status code, and security requirements.</p>", "alignment": "left"}},
    {"id": "dx4b07", "type": "heading", "props": {"text": "Using $ref for Reusable Schemas", "level": 2, "alignment": "left"}},
    {"id": "dx4b08", "type": "text", "props": {"html": "<p>The components section lets you define schemas once and reference them everywhere with <code>$ref: '#/components/schemas/User'</code>. Instead of repeating the same User object in 20 endpoints, define it once. This keeps your spec DRY and your generated docs consistent.</p>", "alignment": "left"}},
    {"id": "dx4b09", "type": "heading", "props": {"text": "OpenAPI Tools to Know", "level": 2, "alignment": "left"}},
    {"id": "dx4b10", "type": "list", "props": {"items": ["Swagger Editor — browser-based editor with live preview", "Stoplight Studio — visual OpenAPI editor with collaboration", "Redocly — OpenAPI linting and documentation generation", "Doxly — connects your spec to auto-generated interactive docs with try-it console"], "style": "bullet"}},
    {"id": "dx4b11", "type": "callout", "props": {"title": "Design-First vs Code-First", "text": "Write your OpenAPI spec before you write your API code (design-first). This forces you to think through the developer experience before implementation, and gives you mocks to test against immediately.", "type": "info"}}
  ],
  "metadata": {}
}$j4$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_004', 'tag_dx_openapi') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 5: Developer Experience and API Adoption
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_005',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'Developer Experience (DX): How Great API Docs Drive Adoption',
  'developer-experience-api-documentation-adoption',
  'Developer experience is the new product moat. APIs with great documentation get adopted faster, generate less support load, and retain developers longer. Here is how to measure and improve your DX.',
  'PUBLISHED',
  'en',
  9,
  NOW() - INTERVAL '6 days',
  '<h2>What Is Developer Experience (DX)?</h2><p>Developer experience (DX) is how developers feel when they discover, learn, integrate, and use your API. It covers everything from the first impression of your docs landing page to the experience of debugging a webhook signature mismatch at 2am. Great DX is not a luxury — it is a growth strategy.</p><h2>The Business Case for Great DX</h2><p>Twilio famously built their entire go-to-market strategy around developer experience. Their "Send your first SMS in 5 lines of code" getting started guide was a marketing asset as much as a technical resource. The result: developer adoption drove enterprise deals, not the other way around. APIs with strong DX reduce their customer acquisition cost because developers become advocates.</p><h2>Time to First Call (TTFC): The Most Important DX Metric</h2><p>Time to First Call is the time it takes for a new developer to make their first successful API call, starting from zero. This is the single most predictive metric for API adoption. If TTFC is over 30 minutes, most developers will give up before integrating. Stripe optimizes relentlessly for a TTFC of under 5 minutes.</p><h2>The Five DX Pillars for API Documentation</h2><ul><li><strong>Discoverability</strong> — Developers can find what they need quickly through good search and navigation</li><li><strong>Clarity</strong> — Every concept is explained plainly with examples before jargon</li><li><strong>Completeness</strong> — No gaps that force developers to guess or contact support</li><li><strong>Accuracy</strong> — Docs match the actual API behavior 100% of the time</li><li><strong>Recoverability</strong> — When things go wrong, docs help developers fix it quickly</li></ul><h2>Measuring Your Documentation Quality</h2><p>Track these metrics: TTFC for new integrations, support ticket volume and categories, documentation page exit rates, time spent on each documentation page, and developer NPS score. Pages with high exit rates and low time-on-page are the ones causing developers to give up.</p>',
  'Developer experience (DX) is the most important competitive advantage for APIs. Key metric: Time to First Call (TTFC) — how long it takes new developers to make their first successful API call. Five DX pillars: discoverability, clarity, completeness, accuracy, recoverability. Track support ticket volume and page exit rates to find documentation gaps.',
  $j5${
  "version": 1,
  "blocks": [
    {"id": "dx5b01", "type": "heading", "props": {"text": "What Is Developer Experience (DX)?", "level": 2, "alignment": "left"}},
    {"id": "dx5b02", "type": "text", "props": {"html": "<p>Developer experience (DX) is how developers feel when they discover, learn, integrate, and use your API. It covers everything from the first impression of your docs landing page to debugging a webhook signature mismatch at 2am. Great DX is not a luxury — it is a growth strategy.</p>", "alignment": "left"}},
    {"id": "dx5b03", "type": "heading", "props": {"text": "The Business Case for Great DX", "level": 2, "alignment": "left"}},
    {"id": "dx5b04", "type": "text", "props": {"html": "<p>Twilio built their entire go-to-market strategy around developer experience. Their quickstart guide was a marketing asset as much as a technical resource. The result: developer adoption drove enterprise deals, not the other way around. APIs with strong DX reduce their customer acquisition cost because developers become advocates.</p>", "alignment": "left"}},
    {"id": "dx5b05", "type": "heading", "props": {"text": "Time to First Call: The Most Important DX Metric", "level": 2, "alignment": "left"}},
    {"id": "dx5b06", "type": "text", "props": {"html": "<p><strong>Time to First Call (TTFC)</strong> is the time it takes for a new developer to make their first successful API call, starting from zero. This is the single most predictive metric for API adoption. If TTFC is over 30 minutes, most developers will give up. Stripe optimizes relentlessly for a TTFC under 5 minutes.</p>", "alignment": "left"}},
    {"id": "dx5b07", "type": "heading", "props": {"text": "The Five DX Pillars", "level": 2, "alignment": "left"}},
    {"id": "dx5b08", "type": "list", "props": {"items": ["Discoverability — Developers find what they need quickly through search and clear navigation", "Clarity — Every concept explained plainly with examples before jargon", "Completeness — No gaps that force developers to guess or contact support", "Accuracy — Docs match actual API behavior 100% of the time", "Recoverability — When things go wrong, docs help developers fix it fast"], "style": "bullet"}},
    {"id": "dx5b09", "type": "heading", "props": {"text": "Measuring Your Documentation Quality", "level": 2, "alignment": "left"}},
    {"id": "dx5b10", "type": "list", "props": {"items": ["TTFC — average time from signup to first successful API call", "Support ticket volume and which endpoints generate the most tickets", "Documentation page exit rates — high exit = confused developers", "Time spent per page — low time on a complex topic = skimming, not reading", "Developer NPS — would they recommend your API to a colleague?"], "style": "bullet"}}
  ],
  "metadata": {}
}$j5$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_005', 'tag_dx_devex') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 6: API Authentication Documentation
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_006',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'API Authentication Documentation: How to Explain OAuth 2.0, API Keys, and JWT',
  'api-authentication-documentation-oauth-api-keys-jwt',
  'Authentication is the hardest part of any API to document well. Most docs leave developers confused about flows, scopes, and token management. Here is how to document auth clearly.',
  'PUBLISHED',
  'en',
  10,
  NOW() - INTERVAL '5 days',
  '<h2>Why Authentication Documentation Is Always Inadequate</h2><p>Authentication is consistently the section of API documentation that generates the most support tickets. The reason: developers understand what they need to do (get a token, include it in requests) but not exactly how to do it for your specific implementation. Every OAuth flow has subtle variations. Every API key format is slightly different. Every JWT claim set is unique.</p><h2>Documenting API Key Authentication</h2><p>API key authentication is the simplest to implement but easy to document poorly. Cover all of these: where to find or generate the API key, the exact format (header name, prefix), whether to include in header or query parameter, key scopes and permissions, key rotation procedures, and what error to expect if the key is invalid or expired.</p><h2>Documenting OAuth 2.0 Flows</h2><p>OAuth 2.0 has four grant types (Authorization Code, Client Credentials, Implicit, Resource Owner Password). Document which flows you support and why. For each flow: show the complete sequence diagram, list every request parameter, show the exact token response, document token expiry and refresh, and provide a complete working example.</p><h2>Documenting JWT Tokens</h2><p>If you issue JWTs, document: the algorithm (RS256, HS256), the complete claim set and what each claim means, how to validate the token signature, where to get your public key (JWKS endpoint), and token lifetime and refresh strategy.</p><h2>The Auth Quickstart</h2><p>Every API needs a minimal authentication quickstart that shows, in under 10 lines of code, how to authenticate and make one authenticated request. Show curl first — it is language-agnostic and works for every developer. Then show your main supported languages. Make it copyable and runnable with real test credentials.</p>',
  'API authentication documentation guide covering API keys, OAuth 2.0, and JWT. API key docs need: key location, format, header name, scopes, rotation. OAuth docs need: supported flows, sequence diagrams, token requests and responses, refresh logic. JWT docs need: algorithm, claims, JWKS endpoint. Always include an auth quickstart under 10 lines of code.',
  $j6${
  "version": 1,
  "blocks": [
    {"id": "dx6b01", "type": "heading", "props": {"text": "Why Authentication Documentation Is Always Inadequate", "level": 2, "alignment": "left"}},
    {"id": "dx6b02", "type": "text", "props": {"html": "<p>Authentication is consistently the section of API documentation that generates the most support tickets. The reason: developers understand what they need to do (get a token, include it in requests) but not exactly how to do it for your specific implementation. Every OAuth flow has subtle variations. Every API key format is slightly different.</p>", "alignment": "left"}},
    {"id": "dx6b03", "type": "heading", "props": {"text": "Documenting API Key Authentication", "level": 2, "alignment": "left"}},
    {"id": "dx6b04", "type": "list", "props": {"items": ["Where to find or generate the API key (link directly to the dashboard)", "The exact header name and format (e.g. Authorization: Bearer sk_live_...)", "Whether to use header or query parameter (and security implications of each)", "Key scopes and what each scope grants access to", "Key rotation procedures and how long old keys remain valid", "Error codes for invalid, expired, or revoked keys"], "style": "bullet"}},
    {"id": "dx6b05", "type": "heading", "props": {"text": "Documenting OAuth 2.0 Flows", "level": 2, "alignment": "left"}},
    {"id": "dx6b06", "type": "text", "props": {"html": "<p>OAuth 2.0 has four grant types. Document which flows you support and why. For each supported flow:</p>", "alignment": "left"}},
    {"id": "dx6b07", "type": "list", "props": {"items": ["Complete sequence diagram showing every step", "Every request parameter — required and optional — with descriptions", "The exact token response schema with all fields explained", "Token expiry, refresh token flow, and refresh token lifetime", "Scope list with plain-language descriptions of what each scope allows", "A working end-to-end code example"], "style": "bullet"}},
    {"id": "dx6b08", "type": "heading", "props": {"text": "The Auth Quickstart", "level": 2, "alignment": "left"}},
    {"id": "dx6b09", "type": "text", "props": {"html": "<p>Every API needs a minimal authentication quickstart that shows, in under 10 lines of code, how to authenticate and make one authenticated request. Show curl first — it works for every developer. Then show your main supported languages with copyable, runnable examples using test credentials.</p>", "alignment": "left"}},
    {"id": "dx6b10", "type": "callout", "props": {"title": "Security Note", "text": "Always document that API keys and tokens should never be committed to source control or exposed in client-side JavaScript. Show how to load them from environment variables in every code example.", "type": "warning"}}
  ],
  "metadata": {}
}$j6$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_006', 'tag_dx_apidocs') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 7: API Versioning Documentation
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_007',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'API Versioning: How to Document Breaking Changes Without Losing Developers',
  'api-versioning-document-breaking-changes',
  'Breaking changes are inevitable. How you document them determines whether developers trust you or abandon you. A guide to versioning strategies, deprecation notices, migration guides, and changelog best practices.',
  'PUBLISHED',
  'en',
  9,
  NOW() - INTERVAL '4 days',
  '<h2>The Cost of Breaking Changes</h2><p>A breaking change that is poorly communicated or documented can instantly break integrations for thousands of developers. Even when the change is necessary and well-intentioned, a bad deprecation process destroys developer trust. The companies that developers trust most — Stripe, GitHub, Twilio — are the ones that never surprise them with breaking changes.</p><h2>What Counts as a Breaking Change?</h2><p>Not every API change is breaking. Understanding the difference helps you prioritize your communication and documentation effort. Breaking changes include: removing an endpoint or parameter, changing a parameter from optional to required, changing a response field type or format, changing authentication requirements, and changing rate limits in ways that could cause existing integrations to fail.</p><h2>Versioning Strategies and How to Document Each</h2><p>The three main versioning strategies each have different documentation requirements. URL versioning (/v1/, /v2/) is the most common and easiest to document because each version has a separate documentation site. Header versioning requires documenting which header to set and what values are valid. Date-based versioning (Stripe''s approach) requires documenting your API date version header and a changelog organized by date.</p><h2>Writing a Great Migration Guide</h2><p>When you release a new version with breaking changes, a migration guide is mandatory. A great migration guide includes: a summary of what changed and why, a timeline with deprecation date and sunset date, a diff showing old and new request/response shapes, complete before/after code examples for every breaking change, and clear instructions for testing the migration.</p><h2>Changelog Best Practices</h2><p>Your API changelog is a trust-building tool. Publish it publicly, organize it chronologically, label every entry (Added, Changed, Deprecated, Removed, Fixed, Security), link to the relevant documentation for each change, and never delete or modify historical entries.</p>',
  'API versioning documentation guide. Breaking changes include removing endpoints, changing parameter types, altering response fields. Three versioning strategies: URL versioning, header versioning, date-based versioning. Migration guides need: summary of changes, timeline with deprecation and sunset dates, before/after code examples. Maintain a public changelog organized chronologically with clear labels.',
  $j7${
  "version": 1,
  "blocks": [
    {"id": "dx7b01", "type": "heading", "props": {"text": "The Cost of Breaking Changes", "level": 2, "alignment": "left"}},
    {"id": "dx7b02", "type": "text", "props": {"html": "<p>A breaking change that is poorly communicated can instantly break integrations for thousands of developers. The companies developers trust most — Stripe, GitHub, Twilio — are the ones that never surprise them with breaking changes. Their secret: meticulous documentation and long deprecation windows.</p>", "alignment": "left"}},
    {"id": "dx7b03", "type": "heading", "props": {"text": "What Counts as a Breaking Change?", "level": 2, "alignment": "left"}},
    {"id": "dx7b04", "type": "list", "props": {"items": ["Removing an endpoint or any parameter", "Changing a parameter from optional to required", "Changing a response field type (string to integer, object to array)", "Changing authentication requirements", "Reducing rate limits in ways that could fail existing integrations", "Changing error response formats that callers parse"], "style": "bullet"}},
    {"id": "dx7b05", "type": "heading", "props": {"text": "Versioning Strategies", "level": 2, "alignment": "left"}},
    {"id": "dx7b06", "type": "list", "props": {"items": ["URL versioning (/v1/, /v2/) — most common, easiest to document with separate docs per version", "Header versioning — document which header to set and every valid value", "Date-based versioning (Stripe-style) — document the API-Version header and maintain a full date changelog"], "style": "bullet"}},
    {"id": "dx7b07", "type": "heading", "props": {"text": "Writing a Great Migration Guide", "level": 2, "alignment": "left"}},
    {"id": "dx7b08", "type": "list", "props": {"items": ["Summary of what changed and the reason why", "Timeline: deprecation date and hard sunset date", "Diff showing old and new request and response shapes side by side", "Complete before-and-after code examples for every breaking change", "How to test the migration without affecting production"], "style": "bullet"}},
    {"id": "dx7b09", "type": "heading", "props": {"text": "Changelog Best Practices", "level": 2, "alignment": "left"}},
    {"id": "dx7b10", "type": "text", "props": {"html": "<p>Your API changelog is a trust-building tool. Publish it publicly, organize chronologically, and use standard labels: <strong>Added</strong>, <strong>Changed</strong>, <strong>Deprecated</strong>, <strong>Removed</strong>, <strong>Fixed</strong>, <strong>Security</strong>. Link to relevant documentation for each change. Never delete or modify historical entries.</p>", "alignment": "left"}}
  ],
  "metadata": {}
}$j7$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_007', 'tag_dx_apidocs') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 8: Auto-Generate API Documentation
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_008',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'How to Auto-Generate API Documentation (And Keep It Always Up to Date)',
  'auto-generate-api-documentation-keep-up-to-date',
  'Manual API documentation always goes out of date. Learn how to generate docs automatically from OpenAPI specs, code annotations, and live traffic — and set up a pipeline that keeps docs in sync forever.',
  'PUBLISHED',
  'en',
  10,
  NOW() - INTERVAL '3 days',
  '<h2>The Manual Documentation Problem</h2><p>Writing API documentation manually is a trap. It starts out accurate, but the moment your first sprint ships new changes, the docs start drifting from reality. Within a year, most hand-written API docs are significantly out of date. Developers learn not to trust them. Support tickets increase. Adoption drops.</p><p>The only sustainable solution is to generate documentation from code — automatically, as part of your development workflow.</p><h2>Method 1: Generate from OpenAPI Spec</h2><p>The most common approach is to write or generate an OpenAPI specification and use it as the source of truth for your documentation. Tools like Doxly, Redoc, and Swagger UI can render beautiful documentation directly from your OpenAPI YAML or JSON file. The spec can be written manually, generated from code annotations, or exported from your API framework.</p><h2>Method 2: Generate from Code Annotations</h2><p>Most modern API frameworks support generating an OpenAPI spec from code annotations. FastAPI does this automatically in Python. Spring Boot uses Springdoc. Express apps can use swagger-jsdoc. Go frameworks like Gin support swaggo. The advantage: your documentation lives next to your code and updates automatically when the code changes.</p><h2>Method 3: Learn from Live Traffic</h2><p>Some tools can observe your actual API traffic and generate or update documentation based on what your API actually returns. This is useful for undocumented legacy APIs, catching undocumented endpoints that developers are already using, and validating that your spec matches your actual behavior.</p><h2>Building a Documentation CI/CD Pipeline</h2><p>Integrate documentation generation into your CI/CD pipeline: on every pull request, validate your OpenAPI spec against linting rules, run doc tests to confirm examples still work, and block the merge if the spec is invalid. On merge to main, automatically build and deploy updated documentation. With Doxly, you can connect your Git repo and have docs update automatically on every push.</p>',
  'Auto-generate API documentation to keep it always accurate. Three methods: generate from OpenAPI spec using tools like Doxly or Redoc, generate from code annotations in FastAPI, Spring Boot, Express or Go frameworks, and learn from live API traffic. Build a documentation CI/CD pipeline that validates your spec on every PR and deploys updated docs automatically on merge.',
  $j8${
  "version": 1,
  "blocks": [
    {"id": "dx8b01", "type": "heading", "props": {"text": "The Manual Documentation Problem", "level": 2, "alignment": "left"}},
    {"id": "dx8b02", "type": "text", "props": {"html": "<p>Writing API documentation manually is a trap. It starts out accurate, but the moment your first sprint ships new changes, the docs start drifting from reality. Within a year, most hand-written API docs are significantly out of date. Developers learn not to trust them. The only sustainable solution: generate documentation from code automatically.</p>", "alignment": "left"}},
    {"id": "dx8b03", "type": "heading", "props": {"text": "Method 1: Generate from OpenAPI Spec", "level": 2, "alignment": "left"}},
    {"id": "dx8b04", "type": "text", "props": {"html": "<p>Write or generate an OpenAPI specification and use it as the source of truth. Tools like Doxly, Redoc, and Swagger UI render beautiful documentation directly from your OpenAPI YAML or JSON. The spec can be written manually, generated from code annotations, or exported from your API framework.</p>", "alignment": "left"}},
    {"id": "dx8b05", "type": "heading", "props": {"text": "Method 2: Generate from Code Annotations", "level": 2, "alignment": "left"}},
    {"id": "dx8b06", "type": "list", "props": {"items": ["FastAPI (Python) — generates OpenAPI spec automatically, zero config required", "Spring Boot — Springdoc annotation library generates spec from @Operation and @Schema annotations", "Express.js — swagger-jsdoc generates spec from JSDoc comments", "Go Gin — swaggo generates spec from code comments", "Rails — rswag generates spec from RSpec tests"], "style": "bullet"}},
    {"id": "dx8b07", "type": "heading", "props": {"text": "Building a Documentation CI/CD Pipeline", "level": 2, "alignment": "left"}},
    {"id": "dx8b08", "type": "list", "props": {"items": ["On every PR: lint the OpenAPI spec against style rules (Redocly CLI, Spectral)", "On every PR: run doc tests that make real API calls and verify the response matches the spec", "Block merge if spec is invalid or examples fail", "On merge to main: automatically build and deploy updated documentation", "Connect your Git repo to Doxly for automatic doc deployments on every push"], "style": "bullet"}},
    {"id": "dx8b09", "type": "callout", "props": {"title": "Pro Tip", "text": "Treat your OpenAPI spec like production code. Require PR reviews, run linters, and never allow a merge that breaks the spec. When docs are code, they stay accurate.", "type": "success"}}
  ],
  "metadata": {}
}$j8$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_008', 'tag_dx_devtools') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 9: API Getting Started Guide
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_009',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'How to Write an API Getting Started Guide That Converts Developers',
  'api-getting-started-guide-that-converts-developers',
  'Your getting started guide is the most important page in your documentation. It determines whether a developer integrates or gives up. Here is the exact structure that works, with examples from Stripe and Twilio.',
  'PUBLISHED',
  'en',
  9,
  NOW() - INTERVAL '2 days',
  '<h2>Why Your Getting Started Guide Is Your Most Important Page</h2><p>A developer reading your getting started guide has already decided to try your API. They are motivated. But motivation fades fast — within 20-30 minutes of confusion, most developers will close the tab and move on. Your getting started guide has one job: get them to a working, successful API call before that happens.</p><h2>The Anatomy of a Perfect Quickstart</h2><p>The best getting started guides in the industry (Stripe, Twilio, Plaid) share the same structure. They start with prerequisites (just an API key — nothing to install), immediately show the first API call in curl, show the expected response, then guide developers to the next meaningful action. The whole thing fits in one screen.</p><h2>Step 1: Minimize Prerequisites</h2><p>Every prerequisite you add before the first API call is a dropout point. The ideal quickstart requires only: an API key (available immediately after signup, no approval process) and a terminal or the ability to install one library. No database setup. No server configuration. No ngrok for webhooks yet. Save complexity for later guides.</p><h2>Step 2: Choose the Right First Action</h2><p>The first API call should be simple, fast, and feel meaningful. Not "Hello World" — that feels like a toy. Instead, show an action that represents real value: create a payment, send a message, query your first record, or trigger an event. Something the developer can show their team and say "look what this API does."</p><h2>Step 3: Show Real Response Data</h2><p>After the first API call, show the complete response — not a truncated version. Comment on the important fields. Explain what each key piece of data means and what the developer can do with it. This is where they start understanding the data model.</p><h2>Step 4: Point to the Next Step</h2><p>End your quickstart with clear signposts for what to do next. Link to the 3-4 most common next steps: handling errors, working with pagination, webhooks, or your SDK. Developers who know what to do next keep going. Developers who are left without direction close the tab.</p>',
  'API getting started guide structure that converts developers. Minimize prerequisites to just an API key. Choose a first action that feels meaningful and shows real value. Show the complete response with explanations. End with clear signposts for next steps. Follow the structure used by Stripe and Twilio: get to a working API call in under 5 minutes.',
  $j9${
  "version": 1,
  "blocks": [
    {"id": "dx9b01", "type": "heading", "props": {"text": "Why Your Getting Started Guide Is Your Most Important Page", "level": 2, "alignment": "left"}},
    {"id": "dx9b02", "type": "text", "props": {"html": "<p>A developer reading your getting started guide has already decided to try your API. They are motivated. But motivation fades fast — within 20-30 minutes of confusion, most developers close the tab. Your quickstart has one job: get them to a working API call before that happens.</p>", "alignment": "left"}},
    {"id": "dx9b03", "type": "heading", "props": {"text": "The Quickstart Structure That Works", "level": 2, "alignment": "left"}},
    {"id": "dx9b04", "type": "list", "props": {"items": ["Prerequisites — API key only, available immediately after signup with no approval process", "First API call in curl — language-agnostic, works for every developer", "Expected response — complete, not truncated, with comments on important fields", "Explanation of the data model — what the response fields mean", "Next steps — 3-4 clear links to common follow-on actions"], "style": "number"}},
    {"id": "dx9b05", "type": "heading", "props": {"text": "Step 1: Minimize Prerequisites", "level": 2, "alignment": "left"}},
    {"id": "dx9b06", "type": "text", "props": {"html": "<p>Every prerequisite before the first API call is a dropout point. The ideal quickstart requires only an API key and a terminal. No database setup. No server configuration. No ngrok for webhooks yet — save complexity for later guides.</p>", "alignment": "left"}},
    {"id": "dx9b07", "type": "heading", "props": {"text": "Step 2: Choose the Right First Action", "level": 2, "alignment": "left"}},
    {"id": "dx9b08", "type": "text", "props": {"html": "<p>The first API call should feel meaningful, not like a toy. Instead of returning a static string, show an action that represents real value: create a payment, send a message, query a real record. Something the developer can show their team and say <em>look what this API can do.</em></p>", "alignment": "left"}},
    {"id": "dx9b09", "type": "heading", "props": {"text": "Step 4: Point to the Next Step", "level": 2, "alignment": "left"}},
    {"id": "dx9b10", "type": "text", "props": {"html": "<p>End your quickstart with clear signposts. Link to the 3-4 most common next steps: error handling, pagination, webhooks, SDK installation. Developers who know what to do next keep going. Developers left without direction close the tab.</p>", "alignment": "left"}},
    {"id": "dx9b11", "type": "callout", "props": {"title": "Benchmark", "text": "If your getting started guide takes more than 10 minutes to complete, it is too long. Time it yourself with a fresh account and no prior knowledge. Then cut everything that is not essential.", "type": "info"}}
  ],
  "metadata": {}
}$j9$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_009', 'tag_dx_devex') ON CONFLICT DO NOTHING;

-- ============================================================
-- POST 10: Doxly vs ReadMe vs Stoplight
-- ============================================================
INSERT INTO posts (id, "projectId", "organizationId", "authorId", title, slug, excerpt, status, locale, "readingTime", "publishedAt", "contentHtml", "contentPlain", content, "createdAt", "updatedAt")
VALUES (
  'post_dx_010',
  'clld001doxlyproject000000',
  'cmmhq0kf20001lm017xtbgefh',
  'cmmhpoj1m0000pb01bxuscrm9',
  'API Documentation Tools Compared: Doxly vs ReadMe vs Stoplight (2026)',
  'api-documentation-tools-compared-doxly-readme-stoplight',
  'Choosing the right API documentation tool can save hundreds of hours and significantly impact developer adoption. A direct comparison of the top tools in 2026 across features, pricing, and developer experience.',
  'PUBLISHED',
  'en',
  10,
  NOW() - INTERVAL '1 day',
  '<h2>The API Documentation Tools Landscape</h2><p>The market for API documentation tools has matured significantly. There are now several strong options, each with a different philosophy: some focus on design-first workflows, others on developer portals, and others on automation and always-accurate docs. Choosing the right tool depends on your team size, workflow, and how much customization you need.</p><h2>What to Look For in an API Documentation Tool</h2><ul><li><strong>OpenAPI support</strong> — Can it import and render OpenAPI specs? Does it support OpenAPI 3.1?</li><li><strong>Try-it console</strong> — Can developers make real API calls from the docs?</li><li><strong>Auto-sync</strong> — Can it automatically update when your API changes?</li><li><strong>Customization</strong> — Can you match your brand, custom domain, custom CSS?</li><li><strong>Versioning</strong> — Can you maintain docs for multiple API versions simultaneously?</li><li><strong>Search</strong> — Is there full-text search across all documentation?</li><li><strong>Analytics</strong> — Can you see which docs pages developers visit most?</li></ul><h2>Doxly: Auto-Generated, Always Accurate</h2><p>Doxly is built around one core idea: documentation should never be written manually. Connect your API endpoint, webhook definitions, or OpenAPI spec, and Doxly generates and maintains your documentation automatically. It is designed for teams that want to move fast without worrying about documentation drift. Best for: API-first companies, developer tools, and teams that ship frequently.</p><h2>ReadMe: The Developer Hub</h2><p>ReadMe positions itself as a complete developer hub rather than just documentation. It includes API reference, guides, changelog, and a developer dashboard where users can see their own API usage. It is more flexible and feature-rich than most tools, but also more complex to set up and more expensive. Best for: mature APIs with large developer communities.</p><h2>Stoplight: Design-First Workflows</h2><p>Stoplight is built for teams that practice API design before development. Its visual editor lets you design your OpenAPI spec without writing YAML, and it generates documentation and mocking environments from the spec. Best for: teams doing API-first design or large organizations that need governance across many APIs.</p><h2>Which Tool Should You Choose?</h2><p>If your priority is keeping docs accurate with minimal effort — choose Doxly. If you need a full developer community hub with user analytics — consider ReadMe. If you have a large team that needs API governance and design tools — look at Stoplight. All three are significantly better than maintaining documentation in a wiki or Notion.</p>',
  'API documentation tools compared: Doxly vs ReadMe vs Stoplight. Key criteria: OpenAPI support, try-it console, auto-sync with API changes, customization, versioning, search, analytics. Doxly: auto-generated always-accurate docs, best for fast-moving teams. ReadMe: complete developer hub with user analytics. Stoplight: design-first workflows with visual OpenAPI editor. All three beat documentation in wikis or Notion.',
  $j10${
  "version": 1,
  "blocks": [
    {"id": "dx10b01", "type": "heading", "props": {"text": "The API Documentation Tools Landscape", "level": 2, "alignment": "left"}},
    {"id": "dx10b02", "type": "text", "props": {"html": "<p>The market for API documentation tools has matured significantly. There are now several strong options, each with a different philosophy: some focus on design-first workflows, others on developer portals, and others on automation. Choosing the right tool depends on your team size, workflow, and how much automation you need.</p>", "alignment": "left"}},
    {"id": "dx10b03", "type": "heading", "props": {"text": "What to Look For", "level": 2, "alignment": "left"}},
    {"id": "dx10b04", "type": "list", "props": {"items": ["OpenAPI support — Import and render OpenAPI 3.1 specs", "Try-it console — Developers make real API calls from the docs", "Auto-sync — Docs update automatically when your API changes", "Custom domain and branding — Match your product identity", "Multi-version support — Maintain docs for v1, v2, v3 simultaneously", "Full-text search across all documentation pages", "Analytics — See which pages developers visit, where they drop off"], "style": "bullet"}},
    {"id": "dx10b05", "type": "heading", "props": {"text": "Doxly: Auto-Generated, Always Accurate", "level": 2, "alignment": "left"}},
    {"id": "dx10b06", "type": "text", "props": {"html": "<p>Doxly is built around one idea: documentation should never be written manually. Connect your API, webhook definitions, or OpenAPI spec, and Doxly generates and maintains your docs automatically. Best for API-first companies and teams that ship frequently.</p>", "alignment": "left"}},
    {"id": "dx10b07", "type": "heading", "props": {"text": "ReadMe: The Developer Hub", "level": 2, "alignment": "left"}},
    {"id": "dx10b08", "type": "text", "props": {"html": "<p>ReadMe positions itself as a complete developer hub: API reference, guides, changelog, and a developer dashboard where users see their own API usage. More flexible and feature-rich, but also more complex to set up. Best for mature APIs with large developer communities.</p>", "alignment": "left"}},
    {"id": "dx10b09", "type": "heading", "props": {"text": "Stoplight: Design-First Workflows", "level": 2, "alignment": "left"}},
    {"id": "dx10b10", "type": "text", "props": {"html": "<p>Stoplight is built for API-first teams. Its visual editor lets you design your OpenAPI spec without writing YAML, generating documentation and mocking environments automatically. Best for large organizations that need API governance and design consistency across many APIs.</p>", "alignment": "left"}},
    {"id": "dx10b11", "type": "heading", "props": {"text": "The Verdict", "level": 2, "alignment": "left"}},
    {"id": "dx10b12", "type": "list", "props": {"items": ["Doxly — Best for: teams that want always-accurate docs with minimal manual effort", "ReadMe — Best for: mature APIs needing a full developer community hub", "Stoplight — Best for: design-first teams and API governance at scale", "All three — Far better than writing docs in Notion, Confluence, or a wiki"], "style": "bullet"}}
  ],
  "metadata": {}
}$j10$::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "contentHtml" = EXCLUDED."contentHtml", "contentPlain" = EXCLUDED."contentPlain";

INSERT INTO post_tags ("postId", "tagId") VALUES ('post_dx_010', 'tag_dx_devtools') ON CONFLICT DO NOTHING;

-- Update project post count
UPDATE projects SET "postCount" = 10 WHERE id = 'clld001doxlyproject000000';
