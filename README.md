# Renewal Decision Brief

A working prototype for one stage of the contract lifecycle: the intelligent repository.

For every signed supplier contract it answers one question for the procurement team:
what is the last safe date to say no before this renews itself, what happens if we do nothing, and how do we know.

- The model reads contract language and quotes the passage it relied on.
- Plain code checks that each quoted passage really appears in the document, then calculates the dates.
- Named people decide. The tool never contacts a supplier.

## Layout

- `public/` the site. No build step.
- `public/js/core/` date arithmetic, quote verification and status rules. Plain code, covered by tests.
- `api/` two small server functions. The AI key lives only in the server environment.
- `server/` the model instructions, the output schema and the API call.
- `tests/` run with `npm test`.

Sample contracts are synthetic unless marked as real public filings.
