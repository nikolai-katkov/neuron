# Video Prompts for Mand & Tact Intro Videos

## Overview

4 educational intro videos (2 concepts x 2 languages) for parents of toddlers (0-18 months).

| Video | Concept           | Language | Source Doc          | Prompt              |
| ----- | ----------------- | -------- | ------------------- | ------------------- |
| 1     | Mand (Requesting) | EN       | `mand-en-source.md` | `mand-en-prompt.md` |
| 2     | Mand (Requesting) | RU       | `mand-ru-source.md` | `mand-ru-prompt.md` |
| 3     | Tact (Labeling)   | EN       | `tact-en-source.md` | `tact-en-prompt.md` |
| 4     | Tact (Labeling)   | RU       | `tact-ru-source.md` | `tact-ru-prompt.md` |

## Requirements

- Duration: 2-3 minutes each
- Style: hand-drawn animation, soft colors, simple characters
- Audience: parents (not specialists), warm and supportive tone
- No professional terminology (no "ABA", no "verbal operant", no "reinforcement")
- EN/RU pairs: identical visuals frame-by-frame, different audio
- Same examples across languages (cookie, ball, juice, etc. — visually identical objects)
- Focus: WHY this skill matters (60%), then WHAT it is (20%), then HOW it develops (20%)
- CTA: "Start the assessment"

## How to use with NotebookLM

1. Create a new notebook
2. Paste the **source document** as a text source
3. Go to Studio > Video Overview
4. Paste the **prompt** into the prompt field
5. Generate

## How to use with other tools

The source documents contain ALL domain knowledge needed — they are self-contained and do not require access to the codebase. Paste the source document as context/knowledge, and the prompt as instructions.

## Visual consistency between EN/RU

The prompts describe identical visual scenes in the same order. However, AI generation is non-deterministic. For truly identical frames:

1. Generate one language version
2. Extract the visual track
3. Re-dub with the other language audio

Or generate both and accept "same style, same structure" rather than pixel-identical frames.
