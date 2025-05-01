# --- Start of template.md ---

# ==============================================================================
# Cairns Document Template
# ==============================================================================
# VERSION: 1.0.0
# SCHEMA: Conforms to cairns-front-matter.schema.json v2.0.1
# PURPOSE: Provides a streamlined starting point for creating new Cairns documents,
#          focusing on essential metadata and best practices.
# USAGE:
# 1. Copy this file to the appropriate directory under `docs/L[0-5]/...`
# 2. Rename the file to match the `id` field below (e.g., `l2-new-principles.md`).
# 3. Fill in the YAML Front Matter below. Fields marked with '*** REQUIRED ***' are mandatory.
#    Other fields are optional but recommended where applicable.
# 4. Write the main content in the Markdown body section.
# 5. *** CRITICAL: Refer to `_dev_docs/front-matter-guidelines.md` ***
#    - For detailed explanations of ALL fields (including those not shown here).
#    - For best practices, anti-patterns, and specific examples.
# 6. *** MANDATORY ACTION: Run local validation scripts BEFORE committing! ***
#    - This prevents CI failures and ensures schema/rule compliance early.
#    - See `README.md` or `_dev_docs/front-matter-guidelines.md` for *how* to run the scripts
#      (e.g., `npm run validate` or `make validate`).
# ==============================================================================

---
# ==============================[ YAML Front Matter ]==============================
# --- Schema Version (Fixed) ---
schema_version: "2.0.1" # DO NOT CHANGE - Indicates the schema this front matter adheres to.

# --- Core Identification (Required) ---
id: "l?-your-doc-id" # *** REQUIRED & UNIQUE ***
# - Document's unique identifier (lowercase, hyphens, numbers allowed).
# - *** MUST EXACTLY MATCH the filename (excluding '.md'). *** CI enforces this.
# - Recommended format: `layer-slug` (e.g., 'l2-design-principles', 'l4-coding-guidelines-js').
# - Uniqueness across all documents is checked by CI.
# - Run local validation to check format, uniqueness, and filename match! (See README/guidelines)
title: "Your Document Title Here" # *** REQUIRED ***
# - Human-readable title. Used in navigation, search results, and the H1 heading below.
layer: "L?" # *** REQUIRED ***
# - Information architecture layer (L0-L5). Defines the document's scope.
# - See `_dev_docs/document-map.md` for layer definitions.
version: "1.0.0" # *** REQUIRED ***
# - Document version (Semantic Versioning 2.0.0 - https://semver.org). Increment on significant changes.

# --- Status & Ownership (Required) ---
status: "DRAFT" # *** REQUIRED ***
# - Current status: DRAFT | WIP | REVIEW | APPROVED | FIXED | DEPRECATED.
# - Start with DRAFT. Status changes affect CI checks and governance (see l0-governance.md).
authors: # *** REQUIRED *** (List, min 1)
  - "Your Name or GitHub Handle"
# - Primary author(s). Use GitHub handles if preferred. Can also be structured objects (see guidelines).
owner: "your-team-slug" # *** REQUIRED ***
# - Responsible owner/team (e.g., 'platform-team', 'backend-guild').
# - Use a team identifier (slug, mailing list), NOT an individual's email.

# --- Timestamps (Required & Optional) ---
last_updated: "YYYY-MM-DDTHH:mm:ssZ" # *** REQUIRED ***
# - Timestamp of the last *meaningful* update (ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ or +/-HH:mm).
# - CI checks temporal consistency (created_at <= last_updated <= expires_at).
# - Run local validation for format and consistency! (See README/guidelines)
# created_at: "YYYY-MM-DDTHH:mm:ssZ" # * Optional *
# - Document creation timestamp (ISO 8601). Useful for tracking history.

# --- Summaries (Required - Crucial for AI & Discovery) ---
abstract: "Very concise summary (~100-120 chars). Think tweet-length. Used for tooltips, previews." # *** REQUIRED ***
summary: "Short summary (~200-300 chars). Provides more context than abstract. Used in search results, AI medium summaries." # *** REQUIRED ***
detail_ref: "#doc-body" # *** REQUIRED ***
# - Reference to the main content.
# - Use '#doc-body' (recommended) to point to the entire Markdown content below.
# - Use '#your-section-id' to link to a specific section anchor within this file.
# - CI checks if the referenced anchor exists. Run local validation! (See README/guidelines)
# --- Importance of Summaries ---
# - Well-written abstract/summary significantly improve AI understanding and searchability.
# - Ensure they accurately reflect the document's core message. See guidelines for tips.

# --- Document Type (Optional but Recommended) ---
# doc_type: "guideline" # * Optional *
# - Type of document (e.g., guideline, reference, playbook, policy).
# - See `document-map.md` and schema (`_dev_docs/front-matter-guidelines.md`) for allowed values.

# --- Language (Optional but Recommended) ---
# language: "ja" # * Optional *
# - Main language code (BCP-47 standard, e.g., 'ja', 'en', 'en-US').
# preferred_langs: ["ja", "en"] # * Optional * (List, min 1 if used)
# - Preferred language order if translations exist. Include 'language'.
# - CI may check BCP-47 format and consistency. See `l0-localization-policy.md` (TBD) for details.

# --- Core Principles (Conditionally Required: L0-L4 MUST have >= 1) ---
# - *** Conditionally Required: MUST have >= 1 principle for layers L0, L1, L2, L3, L4. ***
# - L5 (Ops) documents MAY omit this field. CI checks this based on 'layer'.
# - Each principle needs a unique `principle_id` within this document.
# - The `detail_ref` MUST point to a valid anchor (e.g., '#<principle_id>-details') in the Markdown body below. CI checks anchor existence.
# - See guidelines for details on writing effective principles and the L3/L4 single-principle pattern.
core_principles: []
# # --- Example: Multiple Principles (Typical for L2) ---
# core_principles:
#   - principle_id: "principle-one" # Unique ID within doc (e.g., 'srp', 'dry')
#     title: "Title of the First Principle"
#     status: "DRAFT" # Status of *this* principle
#     summary: "Short summary explaining the core idea of principle one." # *** REQUIRED for each principle ***
#     detail_ref: "#principle-one-details" # *** REQUIRED for each principle *** Anchor to details below (recommend `#<principle_id>-details`).
#   # Optional fields for principles (see guidelines): keywords, snippet_refs, requirement_level, abstract, etc.
#   # snippet_refs: ["./snippets/l2-your-doc-id/principle-one-good.code.ts"] # Example snippet path. CI checks existence.
#   - principle_id: "principle-two"
#     title: "Title of the Second Principle"
#     status: "DRAFT"
#     summary: "Short summary explaining the core idea of principle two."
#     detail_ref: "#principle-two-details"
#
# # --- Example: Single Principle (Typical for L3/L4 Guideline/Process Docs) ---
# # Use this pattern to represent the document's main theme/purpose as a principle.
# core_principles:
#   - principle_id: "l3-your-doc-id-main" # Example ID: layer-docid-main
#     title: "Main Guideline/Purpose of This Document"
#     status: "DRAFT"
#     summary: "A short summary explaining the core purpose or rule defined by this entire document."
#     detail_ref: "#l3-your-doc-id-main-details" # Anchor link to details (can be near the start of the body).

# --- Search & Discovery (Optional but Highly Recommended for AI/Search) ---
# keywords: # * Optional * (List)
#   - "relevant-keyword-1"
#   - "related-topic"
# # - Crucial for searchability and AI/RAG effectiveness. Be descriptive and specific!

# --- Relationships (Optional but Highly Recommended for Knowledge Graph) ---
# relationships: # * Optional * (List)
#   - from: "l?-your-doc-id" # Source: this document ID or 'doc-id#principle-id'
#     to: "l2-design-principles#srp" # Target: another document ID or 'doc-id#principle-id'
#     rel_type: "example_of" # Type (e.g., refines, depends_on, relates_to, example_of, supersedes). See guidelines.
#     description: "This section provides a concrete example of the SRP." # Optional clarification
# # - Defines semantic links between documents/principles. Builds the knowledge graph.
# # - CI checks if 'from' and 'to' targets exist. Run local validation! (See README/guidelines)

# --- Context & Audience (Optional but Recommended for Clarity) ---
# applicable_contexts: # * Optional * (List)
#   - type: "technology" # Context type (e.g., technology, project_phase, domain)
#     value: "react" # Specific value
# # - Specifies where this document applies. Helps filtering and relevance assessment.
# target_audience: # * Optional * (List)
#   - "frontend-developers"
#   - "team-leads"
# # - Intended audience. Helps users determine relevance.

# --- Lifecycle (Optional) ---
# review_cycle_days: 180 # * Optional *
# # - Suggested review frequency in days. Helps schedule reviews.
# expires_at: "YYYY-MM-DDTHH:mm:ssZ" # * Optional *
# # - Date requiring mandatory review or indicating expiration (ISO 8601).
# # - May be linked to `review_cycle_days`. CI may warn on upcoming expiry.
# # - CI checks temporal consistency (`last_updated <= expires_at`). Run local validation!

# --- References (Optional) ---
# references: # * Optional * (List)
#   - title: "Official React Documentation" # Title/description of the reference
#     url: "https://react.dev/" # External URL *OR*
#   # doc_id: "l4-frontend-architecture-guidelines-js" # Internal Cairns doc ID
# # - List related internal documents or external URLs.
# # - CI checks if internal 'doc_id' exists. Run local validation!

# --- Associated Media (Optional) ---
# media: # * Optional * (List)
#   - type: "image" # Type: image, diagram, mermaid, etc.
#     path: "./media/images/l?-your-doc-id/architecture-overview.png" # Recommend: ./media/<type>/<doc-id>/<filename>
#     description: "High-level architecture diagram."
# # - Links to images, diagrams etc. Store files under `media/`. Use recommended path structure.
# # - CI checks if the 'path' exists. Run local validation!

# --- AI/LLM Hints (Optional - Advanced) ---
# llm_usage_hints: # * Optional *
#   # prompt_template: "./prompts/guideline-summary.txt" # Path to a suggested prompt template
#   # embedding_exclude: ["#internal-notes"] # Section anchors/keywords to exclude from embeddings
# # - Hints for AI/LLM processing (e.g., for RAG). See guidelines for details.

# --- Deprecation Info (Required if status: DEPRECATED) ---
# deprecation_info: # * Required IF status is DEPRECATED *
#   reason: "Reason for deprecation (e.g., 'Superseded by new guidelines')."
#   replaced_by_doc: "l?-new-replacement-doc-id" # ID of the replacement document (optional)
#   # notes: "Additional context or migration instructions." # Optional

# --- Governance (Required if status: APPROVED or FIXED) ---
# license: # * Required IF status is APPROVED or FIXED *
#   id: "CC-BY-SA-4.0" # SPDX identifier (e.g., MIT) or custom string (requires 'url').
# checksum: # * Required IF status is APPROVED or FIXED *
#   algorithm: "sha256" # Usually "sha256". Value calculated based on final content.
#   value: "CHECKSUM_PLACEHOLDER" # Placeholder - Will be set during governance process (see l0-governance.md).
# signed_by: # * Required IF status is APPROVED or FIXED * (List, min 1)
#   - algorithm: "pgp" # Method (e.g., pgp).
#     key_identifier: "KEY_FINGERPRINT_OR_ID" # Signing key ID.
#     signature_value: "SIGNATURE_PLACEHOLDER" # Placeholder - Set during governance process.
# # - See `l0-governance.md` (TBD) for checksum/signature generation and verification process.

# ==============================================================================
# Other Optional Fields (Consult front-matter-guidelines.md for details):
# - taxonomies, visibility, maturity, regulatory_refs, risk_level, a11y,
#   prerequisite_documents, templates, exceptions, localized_overrides, etc.
# ==============================================================================
---

# [Your Document Title Here (Should Match 'title' Above)]
# *IMPORTANT:* This H1 heading MUST match the `title` field in the YAML Front Matter above.

<a id="doc-body"></a>

## Introduction

Clearly state the **purpose** and **scope** of this document. Briefly introduce the key concepts, principles, or guidelines covered. Explain **why** this document exists and **who** should read it.

## Section 1: Title <a id="section-1-title"></a>

Explain the first main topic or section. Use clear and concise language.

### Subsection 1.1: Title <a id="subsection-1-1-title"></a>

Provide specific details.

* Use **bullet points** for unordered lists.
* Emphasize key terms using **bold** or *italics*.

1.  Use **numbered lists** for sequential steps or ordered items.
2.  Ensure logical flow and clear separation of ideas.

Embed code examples using Markdown code blocks with language identifiers:

```javascript
// Example JavaScript code demonstrating a concept
function calculateTotal(price, quantity) {
  // Ensure valid inputs (example validation)
  if (typeof price !== 'number' || typeof quantity !== 'number' || price < 0 || quantity < 0) {
    throw new Error("Invalid input: Price and quantity must be non-negative numbers.");
  }
  return price * quantity;
}
```

**Linking:**

  * **Internal Anchors:** Link to other sections within this document like this: [Jump to Section 2](#section-2-title). (Ensure the target anchor exists!)
  * **Other Cairns Docs:** Link to related documents within the Cairns repository using relative paths: See the [Coding Guidelines for JavaScript](../L4-domain/js-stack/l4-coding-guidelines-js.md) for specific rules. (Verify the path!)
  * **External Resources:** Link to external websites or documentation: Refer to the [MDN Web Docs](https://developer.mozilla.org/) for JavaScript details.

**Tables:**

Use tables for structured comparisons or data presentation:

| Category    | Option A        | Option B        | Recommendation |
| :---------- | :-------------- | :-------------- | :------------- |
| Performance | Good            | Excellent       | Option B       |
| Complexity  | Low             | Medium          | Option A       |
| Flexibility | Medium          | High            | Option B       |

**Media (Images/Diagrams):**

  * **Preferred Method:** Define media in the `media:` list in the Front Matter. Reference it descriptively in the text, e.g., "The system architecture is depicted in *Figure 1*." (Readers can find the details in the `media` entry).
  * **Direct Embedding (Use Sparingly):** If necessary, embed directly. Ensure the path is correct (relative to repo root, matching `media` structure is recommended) and **always include meaningful `alt` text** for accessibility.
    ```markdown
    ![Diagram showing user flow through the login process](./media/diagrams/l?-your-doc-id/user-login-flow.png)
    ```
    *(Remember to replace `l?-your-doc-id` with the actual document ID in the path)*

## Section 2: Another Title <a id="section-2-title"></a>

Continue with other sections as needed...

-----

**!!! FINAL CHECKS - DO THIS BEFORE COMMITTING !!!**

1.  **ID & Filename Match:** Does the `id:` field in the Front Matter exactly match this file's name (e.g., `l2-my-principles.md`)?
2.  **Run Local Validation:** Have you executed the local validation script (e.g., `npm run validate` or `make validate`)?
      * **Why?** It catches errors (schema violations, broken links/anchors, invalid IDs, inconsistencies) *before* they reach CI, saving you time and effort.
      * **How?** See `README.md` or `_dev_docs/front-matter-guidelines.md` for specific commands and setup.
3.  **Consult Guidelines:** Have you checked `_dev_docs/front-matter-guidelines.md` for detailed field explanations, best practices, and examples not covered in this template?

# --- End of template.md ---