# AI Interview Coach

create a full stack website based on the scenario given below: The Situation
The AI Cohort is a 31-day enterprise AI engineering program covering modern AI topics including:

Retrieval-Augmented Generation (RAG)

Vector Databases

Prompt Engineering

Agentic AI

Model Context Protocol (MCP)

AI Deployment

Production AI Systems

After completing the cohort, learners should be able to confidently explain the systems they built and the engineering decisions behind them.
However, preparing for technical interviews and effectively communicating this knowledge remains one of the biggest challenges.
Your task is to build an AI Interview Agent that conducts personalized technical interviews based on a candidate's learning journey throughout the cohort.
Your Challenge
Design and build an AI agent capable of conducting a realistic, multi-turn technical interview.
The interview should:

Assess the candidate's understanding of the concepts they have completed.

Adapt naturally throughout the conversation.

Ask intelligent follow-up questions.

Maintain context across the interview.

Provide actionable feedback at the end.

The overall experience should resemble a real technical interview rather than a scripted questionnaire.
What You're Given
Every team will receive the following resources:
1. Curriculum
A structured JSON containing the complete 31-day AI Cohort curriculum, including:

Modules

Daily topics

Learning objectives

Tools used throughout the program

Candidate Profiles
A collection of candidate profiles describing each participant's progress through the cohort, including:

Completed missions

Attempts

Skipped topics

Learning signals

Technical Specification
A separate document defining:

Required API contract

Submission requirements

Request/response formats

Minimum Requirements
Your solution must:

Conduct a conversational technical interview.

Ask a minimum of 8 questions covering at least 4 different curriculum days.

Generate follow-up questions based on previous responses.

Maintain conversation context throughout the interview.

Produce structured feedback at the end of the interview.

Expose the required HTTP endpoint defined in the Technical Specification.

You are free to choose any:

AI models

Frameworks

Agent orchestration strategy

Retrieval pipeline

System architecture

Out of Scope
The following are not required:

Voice interaction

User authentication

Persistent user accounts

Long-term conversation history

Mobile applications

Notes

All curriculum and candidate data provided for this challenge are synthetic and intended solely for the hackathon.

Teams may use any AI models, agent frameworks, vector databases, or supporting technologies.

Creativity in interview flow, reasoning, interaction design, and overall user experience is highly encouraged.

Attached Resources

Curriculum JSON

Candidate Profiles

Technical Specification

3
Autonomous AI Creator
Build an autonomous AI and technology persona that no longer waits for instructions.
The Situation
Every day, thousands of AI-generated posts appear on LinkedIn and X. Almost all of them exist because a human wrote the first prompt.
Today's models are excellent writers. They are rarely autonomous creators.
Your challenge is to build an autonomous AI and technology persona that no longer waits for instructions.
Once initialized, the agent should independently:

Discover topics from live information sources

Decide whether a topic is worth publishing

Write in a consistent editorial voice

Remember previously published content

Continue publishing over time without additional human input

The persona must represent an original identity within the AI and technology ecosystem.
Examples include:

AI Security Researcher

Machine Learning Engineer

AI Product Analyst

Open Source Contributor

Robotics Engineer

Developer Advocate

AI Ethics Researcher

Or any original AI or technology-focused persona

After initialization, the agent must operate autonomously.
Minimum Requirements
Your submission must implement the following capabilities.
1. Topic Discovery
The agent independently discovers AI and technology topics using the web or another live information source.
2. Editorial Judgment
Not every discovered topic deserves publishing.
The agent should demonstrate editorial judgment by intentionally rejecting topics that do not meet its publishing standards.
3. Consistent Persona
Maintain a recognizable identity with:

A consistent writing style

Stable interests

Distinct editorial opinions

A coherent voice

The persona should remain focused on AI and technology throughout the evaluation period.
4. Memory
The agent should remember previously published content to maintain continuity and avoid unnecessary repetition.
5. Autonomous Publishing
Publishing must occur over time rather than generating all content immediately.
Submissions will be observed for approximately 48 hours after initialization. During this period, evaluators may query the feed endpoint multiple times.
New posts should appear without any additional prompts or API calls.
Simulated publishing is acceptable. Integration with real social media platforms is not required.
6. Publishing Rationale
Every published post must include:

Why the topic was selected

Why it is relevant now

The source(s) of information

This information must be returned through the API response.
Evaluation Criteria
Judging will primarily consider:

Autonomous operation after initialization

Quality of editorial decision-making

Consistency of the AI persona

Effective use of memory

Transparency of publishing rationale

Overall quality and coherence of the generated feed

Out of Scope
The following are not required:

Posting to real social media platforms

Multi-platform publishing

Images or videos

Engagement analytics

Multi-agent architectures

Human intervention after initialization

API Requirements
Your submission must expose two HTTP endpoints.
1. Initialize Agent
Called exactly once before evaluation begins.
Endpoint

POST /api/agent/init

Request

{
  "persona": {
    "name": "Ada",
    "domain": "AI Security"
  }
}

Response

{
  "agentId": "abc-123"
}

Retrieve Feed After initialization, this is the only endpoint the evaluator will call. Endpoint

GET /api/agent/feed?agentId=abc-123

Response

{
  "posts": [
    {
      "id": "p7",
      "createdAt": "2026-08-07T10:30:00Z",
      "text": "...",
      "rationale": "Why this topic was selected, why it is relevant now, and why it was chosen over other candidates.",
      "sources": [
        "https://..."
      ]
    }
  ]
}

Feed Requirements

Return posts in reverse chronological order (newest first).

Each post must have a unique id.

createdAt must be an ISO 8601 UTC timestamp.

Previously returned posts should remain available.

If no posts exist, return:

{
  "posts": []
}

Submission Rules

The evaluator will call POST /api/agent/init exactly once.

No further instructions or prompts will be provided.

During the evaluation period, the evaluator will periodically call GET /api/agent/feed.

Any new posts appearing in the feed must be generated entirely by the autonomous agent after initialization.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c3c1792e-09ca-427b-86b7-3cc41005d9db).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
