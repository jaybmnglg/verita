import test from "node:test";
import assert from "node:assert/strict";
import { parseN8nResponse } from "../src/lib/parse-n8n-response.ts";

test("Scenario 1: Standard n8n output with plain text", () => {
  const payload = {
    output: "The official uniform must be worn from Monday to Thursday.",
  };
  const result = parseN8nResponse(payload);
  assert.equal(result.answer, "The official uniform must be worn from Monday to Thursday.");
  assert.equal(result.citations.length, 0);
  assert.equal(result.isInsufficientEvidence, false);
});

test("Scenario 2: n8n output with embedded Source line (verita.json prompt format)", () => {
  const payload = {
    output:
      "Students with three consecutive unexcused absences are subject to disciplinary warning.\n\nSource: Article IV, Section 2, Page 45",
  };
  const result = parseN8nResponse(payload);
  assert.equal(
    result.answer,
    "Students with three consecutive unexcused absences are subject to disciplinary warning."
  );
  assert.equal(result.citations.length, 1);
  assert.equal(result.citations[0].page, "45");
  assert.equal(result.citations[0].section, "Article IV, Section 2");
  assert.equal(result.citations[0].title, "Student Handbook 2025-2026");
  assert.equal(result.citations[0].excerpt, undefined); // No fabricated excerpt
  assert.equal(result.isInsufficientEvidence, false);
});

test("Scenario 3: n8n output with Page range and Handbook title in source", () => {
  const payload = [
    {
      output:
        "A Leave of Absence (LOA) must be filed before the midterm period.\n\nSource: LPU-C Student Handbook, Pages 18-19",
    },
  ];
  const result = parseN8nResponse(payload);
  assert.equal(
    result.answer,
    "A Leave of Absence (LOA) must be filed before the midterm period."
  );
  assert.equal(result.citations.length, 1);
  assert.equal(result.citations[0].page, "18-19");
  assert.equal(result.citations[0].title, "Student Handbook 2025-2026");
  assert.equal(result.isInsufficientEvidence, false);
});

test("Scenario 4: Structured citations returned in payload", () => {
  const payload = {
    output: "Dress code prohibits slippers and revealing attire on campus premises.",
    citations: [
      {
        title: "Student Handbook 2025-2026",
        page: "32",
        section: "Section 4.1",
        excerpt: "Students must be in proper uniform with school ID clearly displayed.",
      },
    ],
  };
  const result = parseN8nResponse(payload);
  assert.equal(
    result.answer,
    "Dress code prohibits slippers and revealing attire on campus premises."
  );
  assert.equal(result.citations.length, 1);
  assert.equal(result.citations[0].page, "32");
  assert.equal(result.citations[0].section, "Section 4.1");
  assert.equal(
    result.citations[0].excerpt,
    "Students must be in proper uniform with school ID clearly displayed."
  );
  assert.equal(result.isInsufficientEvidence, false);
});

test("Scenario 5: Multiple structured sourceDocuments from LangChain", () => {
  const payload = {
    text: "Here are the policies regarding student misconduct and sanctions.",
    sourceDocuments: [
      {
        pageContent: "First offense for cutting classes results in written reprimand.",
        metadata: {
          title: "Student Handbook 2025-2026",
          pageNumber: 50,
          section: "Article VII, Sec 1",
        },
      },
      {
        pageContent: "Second offense results in suspension for 3 days.",
        metadata: {
          title: "Student Handbook 2025-2026",
          pageNumber: 51,
          section: "Article VII, Sec 2",
        },
      },
    ],
  };
  const result = parseN8nResponse(payload);
  assert.equal(result.citations.length, 2);
  assert.equal(result.citations[0].page, "50");
  assert.equal(result.citations[0].excerpt, "First offense for cutting classes results in written reprimand.");
  assert.equal(result.citations[1].page, "51");
  assert.equal(result.citations[1].section, "Article VII, Sec 2");
});

test("Scenario 6: Insufficient evidence response from AI Agent prompt", () => {
  const payload = {
    output:
      "I couldn't find this in the LPU-C Student Handbook. Please check with the appropriate LPU-C office (such as the Registrar, Student Affairs, or your department) for confirmation.",
  };
  const result = parseN8nResponse(payload);
  assert.equal(result.isInsufficientEvidence, true);
  assert.equal(result.citations.length, 0); // No fabricated citations
});

test("Scenario 7: PRD suggested insufficient information phrasing", () => {
  const payload = {
    output: "I couldn't find enough information in the university handbook to answer that reliably.",
  };
  const result = parseN8nResponse(payload);
  assert.equal(result.isInsufficientEvidence, true);
  assert.equal(result.citations.length, 0);
});

test("Scenario 8: Off-topic scope limitation response", () => {
  const payload = {
    output:
      "I can only help with questions about the LPU-C Student Handbook. Feel free to ask me about school policies, rules, or procedures.",
  };
  const result = parseN8nResponse(payload);
  assert.equal(result.isInsufficientEvidence, true);
  assert.equal(result.citations.length, 0);
});

test("Scenario 9: Empty or malformed payload fallback", () => {
  const result = parseN8nResponse({});
  assert.equal(
    result.answer,
    "No response text was received from the handbook assistant."
  );
  assert.equal(result.citations.length, 0);
  assert.equal(result.isInsufficientEvidence, false);
});
