# AI Usage Log — The Interview Agent

## Project Overview

The Interview Agent is an AI-powered technical interview platform that simulates a realistic technical interviewer.

The application analyzes candidate responses, maintains interview context, generates relevant follow-up questions, and progresses through a structured interview plan.

---

## AI Tools Used

- Lovable — Initial application generation, UI development, and AI-assisted coding
- Lovable AI Gateway — AI-powered interview response generation
- VS Code AI assistance — Local development, debugging, refinement, and implementation

---

## Prompt 1 — Initial Application

Build a professional AI-powered technical interview platform.

Create a candidate-facing interview interface where an AI interviewer asks technical questions one at a time, receives candidate answers, analyzes them, and continues the interview based on the candidate's responses.

Include:

- Interview state management
- Question progression
- Conversation history
- Start Interview functionality
- Reset Interview functionality
- Loading states
- Error handling
- Responsive design
- Professional user interface

The interviewer should ask one question at a time and wait for the candidate's response before continuing.

---

## Prompt 2 — AI Interview Engine

Implement an interview engine that uses the candidate's interview plan and conversation history to generate relevant technical interview questions.

Maintain:

- Current interview topic
- Current question
- Question history
- Candidate answers
- Interview progress
- Conversation context

Questions should follow the intended interview sequence and should not be randomly repeated or skipped.

---

## Prompt 3 — Natural Interviewer

Make the AI interviewer behave like a real technical interviewer rather than a scripted chatbot.

For every candidate answer:

1. Understand the candidate's response.
2. Evaluate its relevance and completeness.
3. Consider the previous question and conversation context.
4. Respond naturally to the answer.
5. Ask an appropriate follow-up or next question.

Avoid repetitive phrases such as:

- "Thanks for sharing."
- "With that in mind."
- "Let's continue."
- "Regarding [topic]."
- "You said..."

The interviewer should vary its responses depending on what the candidate actually said.

Do not falsely praise an answer that is incomplete or incorrect.

---

## Prompt 4 — Handling Uncertain Answers

Handle responses such as:

- "I don't know"
- "idk"
- "not sure"
- "no idea"
- "I'm not familiar with this"

The interviewer should respond professionally and naturally.

Do not criticize the candidate.

Do not pretend that the candidate provided an explanation when they did not.

Do not repeatedly use the same response.

Move to the next appropriate question while maintaining the interview sequence.

---

## Prompt 5 — Context-Aware Follow-ups

Make follow-up questions depend on the candidate's previous answer.

If the answer is strong:

- Acknowledge something specific.
- Ask a deeper technical follow-up.

If the answer is partially correct:

- Recognize the correct part.
- Ask about the missing concept.

If the answer is unclear:

- Ask a focused clarification.

If the candidate does not know the answer:

- Respond naturally.
- Move forward appropriately.

The interviewer should maintain conversational context throughout the session.

---

## Prompt 6 — Question Progression

Ensure the interview follows the predefined sequence.

For example:

Day 7 → Day 8 → Day 9 → Day 10

Do not unintentionally skip days.

Do not repeat previously asked questions unless an intentional follow-up is required.

Do not use AI-generated conversation to randomly determine the next interview day.

The existing question-selection logic should remain responsible for determining the intended next question.

---

## Prompt 7 — Remove Hardcoded Responses

Inspect the interview engine and find hardcoded interviewer response templates such as:

"Regarding [topic]..."

"With that in mind..."

"Let's continue..."

"Let's explore another concept..."

"Thanks for that explanation..."

Remove or refactor these fixed response templates.

Generate interviewer responses dynamically based on:

- Candidate's actual answer
- Previous question
- Current topic
- Interview history
- Candidate context

Do not modify the existing question-selection logic while fixing the conversational response generation.

The interviewer should sound natural rather than scripted.

---

## Prompt 8 — Lovable AI Gateway Integration

Integrate the Lovable AI Gateway into the interview engine for AI-powered interviewer response generation.

Authenticate requests using the server-side environment variable:

LOVABLE_API_KEY

Never expose the actual API key in frontend code.

Never commit the actual API key to the GitHub repository.

Use the Lovable AI Gateway to:

- Analyze candidate answers
- Understand the candidate's response
- Generate natural interviewer reactions
- Maintain conversation context
- Generate relevant follow-up questions
- Support realistic interview conversations

The AI response should be based on the candidate's actual answer rather than a fixed response template.

Handle missing API keys, API failures, network errors, timeouts, and invalid responses gracefully.

---

## Prompt 9 — Interview State

Ensure that submitting an answer performs the following flow:

Candidate answer
→ Save answer
→ Analyze answer
→ Generate interviewer response
→ Select appropriate next question
→ Update interview state
→ Display response and question

Preserve conversation history throughout the session.

Prevent duplicate submissions.

Prevent duplicate questions.

Do not lose previous questions or candidate answers when moving forward.

---

## Prompt 10 — Error Handling

Handle Lovable AI Gateway failures, missing LOVABLE_API_KEY, network errors, invalid AI responses, timeouts, and empty candidate answers gracefully.

Show a useful and user-friendly message instead of silently failing.

Do not expose:

- API keys
- Server-side stack traces
- Sensitive configuration
- Internal errors

in the frontend.

---

## Prompt 11 — Start Interview

Debug the Start Interview flow from the frontend button through the server-side interview initialization.

Verify:

- Button handler
- Interview initialization
- Server/API request
- Lovable AI Gateway integration
- Interview state updates
- Loading state
- Error handling

Fix the actual root cause rather than adding a temporary workaround.

After clicking Start Interview, the first interview question must reliably appear.

---

## Prompt 12 — UI Enhancement

Create a polished AI interview experience with:

- Professional homepage
- Clear interviewer messages
- Candidate answer cards
- Interview progress
- Responsive design
- Loading indicators
- Clear answer input
- Start Interview CTA
- Reset Session option
- Modern AI/SaaS visual design

Keep the interface clean, professional, and focused on the interview.

Do not break existing interview functionality.

---

## Prompt 13 — Homepage

Create an attractive professional homepage for The Interview Agent.

The homepage should clearly communicate that the platform provides realistic AI-powered technical interview practice.

Include:

- Hero section
- Strong headline
- Short description
- Start Interview CTA
- Explore Candidates CTA
- How It Works section
- AI-powered interview features
- Context-aware follow-up explanation
- Professional footer

Use a modern AI/SaaS design with responsive layouts.

The Start Interview button must connect to the existing interview flow.

Do not create a fake interview flow.

---

## Prompt 14 — Final Interview Behavior

The final interviewer should feel like a real human technical interviewer.

It should:

- Understand candidate answers
- Remember previous discussion
- Give natural reactions
- Ask relevant follow-ups
- Adjust difficulty when appropriate
- Avoid repetitive phrases
- Maintain interview context
- Follow the intended question sequence
- Handle "I don't know" naturally
- Avoid unnecessary praise
- Avoid hardcoded conversational templates

The goal is to simulate a genuine technical interview rather than a fixed question-and-answer bot.

---

## Prompt 15 — Security

Keep all AI API credentials secure.

Use environment variables for API keys.

The actual LOVABLE_API_KEY must never appear in:

- Frontend source code
- GitHub repository
- PROMPTS.md
- README
- Screenshots
- Public documentation

Only the variable name may be documented.

---

## Prompt 16 — Interview Summary Analytics & Download

Enhance the existing Interview Summary without changing its current structure, sections, layout, scoring, or functionality.

Add:
- Pie/donut charts for performance breakdown
- Graphs for question-wise and topic/skill-wise performance
- Use only actual interview data; never hardcode scores
- Keep all existing Summary components unchanged
- Match the existing UI/design
- Add a "Download Summary" button to export the completed interview summary as a professional PDF
- Include existing scores, feedback, recommendations, and the new charts in the PDF
- Ensure the charts and PDF update correctly for each interview session

This is an additive enhancement only. Do not redesign or rebuild the existing Summary page.

---

## Final Testing

Test the complete flow:

Homepage
→ Start Interview
→ First Question
→ Candidate Answer
→ AI Analysis
→ Natural Interviewer Response
→ Next Question
→ Continued Interview

Test these candidate responses:

1. Strong technical answer
2. Partially correct answer
3. Incorrect answer
4. "I don't know"
5. "idk"
6. "Not sure"
7. Irrelevant answer
8. Very short answer

Verify that:

- Lovable AI Gateway works correctly
- API key is loaded securely
- Interview starts correctly
- Candidate answers are preserved
- AI responses are natural
- "I don't know" is handled appropriately
- Follow-up questions are contextual
- Questions remain in the correct sequence
- Questions are not unintentionally repeated
- Day 9 is not skipped between Day 8 and Day 10
- Hardcoded interviewer prefixes are removed
- Errors are handled gracefully
- UI remains responsive
- No API secrets are exposed

---

## Final Goal

The final application should provide a realistic AI technical interview experience.

The interviewer should understand what the candidate actually says, respond naturally, maintain context, ask meaningful follow-up questions, and progress through the interview in the correct order.

The experience should feel like a conversation with an experienced technical interviewer rather than a scripted chatbot.
