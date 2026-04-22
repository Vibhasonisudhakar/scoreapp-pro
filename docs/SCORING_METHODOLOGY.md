# ScoreApp Scoring Methodology

## Purpose
This document defines how ScoreApp converts SA Excellency model responses into a normalized score and classification band.

## Assessment Criteria
Each criterion is rated on a 0 to 5 scale.

| Criterion ID | Criterion | Weight |
|---|---|---|
| leadership | Leadership and Governance | 22% |
| people | People and Capability | 18% |
| innovation | Innovation and Improvement | 20% |
| operations | Operational Excellence | 20% |
| customer | Customer and Stakeholder Value | 20% |

## Formula
For each criterion:

weighted_points = (rating / 5) * weight * 100

Total score:

total_score = sum(weighted_points for all criteria)

Because weights sum to 1.00, total score is on a 0 to 100 scale.

## Result Bands
- 85 to 100: Excellency Leader
- 70 to 84.99: Strong Performer
- 55 to 69.99: Progressing
- 0 to 54.99: Needs Attention

## Personalization Logic
- Strengths: criteria with rating >= 4
- Focus Areas: two lowest-rated criteria
- Personalized summary text is assigned by result band.

## Spreadsheet Mapping
The application can export a CSV file containing:
- criterion ID
- criterion title
- weight
- max rating
- sample rating
- computed weighted points

This file supports offline review and audit of scoring assumptions.
