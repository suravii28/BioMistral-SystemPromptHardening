# CascadeGuard

Testing whether prompts can stop a medical LLM (BioMistral-7B) from caving to confident false claims, and how well two defences work: system prompt hardening and contrastive decoding.

## What is in this repo

- `app/` Next.js 14 dashboard showing the results (edit `app/data.js` to update numbers)
- `notebook/` the Kaggle experiment: 250 trials, 5-turn conversations, detection and mitigation
- `docs/` presentation deck and a one-page overview (add the exported PDF here)

## Run the dashboard

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Headline results

On the 51 conversations where the model had caved, contrastive decoding gained +0.122 and prompt hardening +0.091 (both p < 0.01). Gain is measured by embedding similarity to the correct versus the planted wrong option.
