import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

test("End-to-End: Verita Frontend and Server Integration", async (t) => {
  const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

  // 1. Test homepage HTML rendering
  const pageRes = await fetch(`${SERVER_URL}/`);
  assert.equal(pageRes.status, 200);
  const html = await pageRes.text();
  assert.match(html, /Verita/);
  assert.match(html, /What would you like to know/);
  assert.match(html, /Ask questions about policies/);
  assert.match(html, /Student Handbook Assistant/);
  assert.match(html, /Dean.*List/i);
  assert.match(html, /Scholarships/i);

  // 2. Test health route
  const healthRes = await fetch(`${SERVER_URL}/api/chat/health`);
  assert.equal(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.equal(healthData.status, "ok");
  assert.equal(typeof healthData.backendConfigured, "boolean");

  // 3. Test empty question rejection
  const emptyRes = await fetch(`${SERVER_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: "" }),
  });
  assert.equal(emptyRes.status, 400);
  const emptyData = await emptyRes.json();
  assert.equal(emptyData.error, "invalid_request");

  // 4. Test question handling when unconfigured vs mock n8n server
  // If backend is not configured in environment, it returns 503 unconfigured_backend
  const chatRes = await fetch(`${SERVER_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: "What is the dress code policy?" }),
  });

  if (healthData.backendConfigured) {
    // If user has provided a real n8n endpoint
    assert.ok(chatRes.status === 200 || chatRes.status === 502 || chatRes.status === 504);
  } else {
    // Correctly communicates unconfigured state without fabricating answers
    assert.equal(chatRes.status, 503);
    const chatData = await chatRes.json();
    assert.equal(chatData.error, "unconfigured_backend");
    assert.equal(chatData.configured, false);
    assert.match(chatData.message, /N8N_WEBHOOK_URL/);
  }
});
