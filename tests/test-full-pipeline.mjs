import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { parseN8nResponse } from "../src/lib/parse-n8n-response.ts";

test("Full n8n workflow pipeline simulation", async (t) => {
  // Mock the exact webhook behavior of verita.json
  const scenarios = [
    {
      name: "Handbook Question: Dress Code Policy",
      incoming: {
        chatInput: "What is the official dress code and uniform policy?",
        sessionId: "session-uniform-1",
      },
      n8nResponse: {
        output:
          "The official university uniform must be worn by all students from Monday to Thursday. Civilian attire following the modest dress code is permitted on designated wash days.\n\nSource: Article V, Section 2, Page 28",
      },
      expectedSection: "Article V, Section 2",
      expectedPage: "28",
      expectedInsufficient: false,
    },
    {
      name: "Handbook Question: Leave of Absence (LOA)",
      incoming: {
        chatInput: "What is the procedure for filing a leave of absence (LOA)?",
        sessionId: "session-loa-2",
      },
      n8nResponse: {
        output:
          "Students applying for a Leave of Absence (LOA) must submit a formal application to the Office of the University Registrar endorsed by the College Dean before the midterm examination period.\n\nSource: LPU-C Student Handbook, Page 42",
      },
      expectedSection: undefined,
      expectedPage: "42",
      expectedInsufficient: false,
    },
    {
      name: "Handbook Question: Question not found in handbook (PRD / prompt rule 4)",
      incoming: {
        chatInput: "What are the rules for off-campus commercial vehicle parking fees?",
        sessionId: "session-unknown-3",
      },
      n8nResponse: {
        output:
          "I couldn't find this in the LPU-C Student Handbook. Please check with the appropriate LPU-C office (such as the Registrar, Student Affairs, or your department) for confirmation.",
      },
      expectedInsufficient: true,
    },
  ];

  for (const scenario of scenarios) {
    await t.test(scenario.name, () => {
      // 1. Verify serialization matches n8n expectations
      assert.ok(scenario.incoming.chatInput, "chatInput is present");
      assert.ok(scenario.incoming.sessionId, "sessionId is present");

      // 2. Parse response
      const normalized = parseN8nResponse(scenario.n8nResponse);

      if (scenario.expectedInsufficient) {
        assert.equal(normalized.isInsufficientEvidence, true);
        assert.equal(normalized.citations.length, 0);
      } else {
        assert.equal(normalized.isInsufficientEvidence, false);
        assert.ok(normalized.citations.length > 0);
        assert.equal(normalized.citations[0].page, scenario.expectedPage);
        if (scenario.expectedSection) {
          assert.equal(normalized.citations[0].section, scenario.expectedSection);
        }
      }
    });
  }
});
