# GateGuard — DIU SQAT Summit Demo Runbook

## Before the presentation

- Start MongoDB and the backend API; confirm `/api/health` reports `status: ok` and `database: connected`.
- Start the frontend with `VITE_API_URL` pointing to the API and `VITE_DEMO_MODE=false`.
- Use a dedicated demo account and a repository created for the presentation. Do not use personal access tokens or real production secrets in slides or screen recordings.
- Configure GitHub OAuth and the repository variables/secrets required by the workflow.
- Ensure the repository contains a passing baseline and a separate commit that intentionally violates a quality rule.
- Verify PDF export and the analysis history before the session.

## Suggested 5–7 minute walkthrough

1. **Problem (45 seconds):** Explain that quality evidence is scattered across lint, tests, coverage and dependency audit outputs.
2. **Connect (60 seconds):** Sign in, connect GitHub and add a repository.
3. **Automate (90 seconds):** Trigger the GitHub Actions workflow and explain that checks run on the isolated GitHub runner.
4. **Evaluate (60 seconds):** Show the submitted metrics, findings and configured quality thresholds.
5. **Demonstrate a failure (60 seconds):** Trigger or show a run with low coverage or a high-severity vulnerability and explain why the release gate fails.
6. **Report (45 seconds):** Open analysis history and export the PDF quality report.
7. **Close (30 seconds):** Summarize how GateGuard turns CI evidence into a consistent release decision.

## Demo safety

- Never display `.env`, GitHub OAuth client secrets, CI tokens, database credentials or real user data.
- Use a throwaway GitHub repository and revoke the demo OAuth authorization after the event if no longer needed.
- Keep a pre-recorded workflow run and PDF report as backup in case venue connectivity is unreliable.
- Clearly label any sample/demo data; never present sample metrics as results from a real analysis.
