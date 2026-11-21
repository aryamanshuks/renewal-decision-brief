# Renewal Decision Brief

Live prototype: https://renewal-decision-brief-seven.vercel.app

A working prototype for one stage of the contract lifecycle: the intelligent repository.

For every signed supplier contract it answers one question for the procurement team:
what is the last safe date to say no before this renews itself, what happens if we do nothing, and how do we know.

- The model reads contract language and quotes the passage it relied on.
- Plain code checks that each quoted passage really appears in the document, then calculates the dates.
- If a date depends on something outside the documents, the tool asks one named person one question instead of guessing.
- Named people decide. The tool never contacts a supplier.

The "About this prototype" page in the product covers why this stage, the stakeholder map, the problem and evidence, the flows, and the success metrics. The "Test bench" page shows 16 cases with expected answers and saved live runs.

## Layout

- `public/` the site. Static files, no build step. Preact and htm are vendored in `public/vendor/`.
- `public/js/core/` date arithmetic, quote verification, status rules, workflow and test cases. Plain code, covered by tests.
- `public/data/` synthetic sample contracts, four real contracts from CUAD (CC BY 4.0), saved model readings and saved test runs.
- `api/` server functions: `extract` (reads a contract family), `health`, `selftest`. The AI key lives only in the server environment.
- `server/` the model instructions, the output shape, input limits, rate limits and the API call.
- `scripts/dev-server.mjs` local server. `MOCK=1` uses hand-written readings in `scripts/mock-extract.mjs` for screen testing only; the site never serves them.
- `tests/` run with `npm test`.

## Running it

Set `ANTHROPIC_API_KEY` in the environment (on Vercel: project settings, environment variables). Optional: `ANTHROPIC_MODEL` (`claude-sonnet-5-5` default, or `claude-haiku-5-5`) and `ANTHROPIC_EFFORT` (`low`, `medium` default, `high`).

Locally: `node scripts/dev-server.mjs 4173`, then open http://localhost:4173.

Every company, person and figure in the samples is invented. The four real contracts on the test bench are exhibits from public SEC filings, taken from the CUAD dataset by The Atticus Project.
