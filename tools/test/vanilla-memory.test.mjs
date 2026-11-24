// Memory panel and recall trace: count line, keyword ranking, weighted recall.
import { test } from "node:test";
import assert from "node:assert/strict";
import { kindWord, memoryCounts, scoreText, memoryMatch, recallScore, recallRank, recallLine } from "../../src/vanilla/memory.ts";

const items = [
  { id: "a", kind: "fact", text: "the user prints in petg", entity: "user" },
  { id: "b", kind: "episode", text: "we talked about the bail relief" },
  { id: "c", kind: "fact", text: "the printer is a creator 5 pro", title: "printer" },
];

test("the count line names every kind, zero counts too", () => {
  assert.equal(kindWord("memory", 2), "memories");
  assert.equal(kindWord("gist", 1), "gist");
  assert.equal(memoryCounts(items, ["episode", "gist", "fact"]), "1 episode, 0 gists, 2 facts");
  assert.equal(memoryCounts([]), "nothing stored.");
  assert.equal(scoreText(1.034), "1.03");
  assert.equal(scoreText(null), "");
});

test("keyword match ranks by share of query terms and filters by kind", () => {
  const hits = memoryMatch(items, { query: "printer petg" });
  assert.deepEqual(hits.map((h) => h.id), ["a", "c"]);
  assert.equal(hits[0].score, 0.5);
  assert.deepEqual(memoryMatch(items, { kind: "fact" }).map((h) => h.id), ["a", "c"]);
  assert.equal(memoryMatch(items, { kind: "fact" })[0].score, null);
  assert.equal(memoryMatch(items, { query: "zzz" }).length, 0);
});

test("weights reorder the trace and top marks what was used", () => {
  const hits = [
    { text: "old but relevant", parts: [{ key: "rel", value: 0.9 }, { key: "rec", value: 0.1 }] },
    { text: "new and loose", parts: [{ key: "rel", value: 0.3 }, { key: "rec", value: 1 }] },
  ];
  assert.equal(recallScore(hits[0].parts), 0.5);
  assert.equal(recallScore(hits[0].parts, { rel: 1, rec: 0 }), 0.9);
  const byRel = recallRank(hits, { rel: 2, rec: 0.5 }, 1);
  assert.equal(byRel[0].text, "old but relevant");
  assert.equal(byRel[0].used, true);
  assert.equal(byRel[1].used, false);
  const byRec = recallRank(hits, { rel: 0.2, rec: 2 }, 1);
  assert.equal(byRec[0].text, "new and loose");
  assert.equal(recallRank([{ text: "x", score: 0.7, parts: [] }])[0].final, 0.7);
  assert.equal(recallLine(6, 3), "6 candidates scored, top 3 used.");
  assert.equal(recallLine(0, 0), "nothing recalled.");
});
