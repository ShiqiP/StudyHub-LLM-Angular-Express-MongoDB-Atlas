### CS572-Final-Project-December-2024

This repository should be "Accepted/Forked" by one member of the team only, they will add their other team member(s) as "collaborators" so they could collaborate and push their code to the same repository. Pair programming is encouraged.

### Application specifications and requirements

It’s up to you to decide your project specs and requirements. Take your time to plan your project idea, write down a short description for it, set your goals, and have a clear scope. Your project must use the following:

- Implement a login-based system with JWT.
- Must use AI features integrated with the application (Tools, RAG.. etc)
- All frontend add/update/delete actions or routes should be protected from public access by JWT (except sign-up and sign-in routes)
- All backend add/update/delete routes should be protected from public access by JWT (except sign-up and sign-in routes)
- Lazy-load the frontend routes, and follow a standard REST design in the backend.
- Both frontend and backend code must be safely typed, you are not allowed to use the explicit `any` type, nor the inferred implicit `any` type.
- Your frontend code must follow the latest Angular API specification, you are not allowed to use old practices.
- Application global state and local state must be declared with signals. Derived states must use computed signals.
- Projects must have proper UI that complies with the web standards (use a UI Kit).

Note: Chat and product listing applications are not allowed.

### Notes

- Before you write any code, and on the first day of the project, write a description of your project, and create a sketch of your UI screens and match them with a MongoDB schema design, and call me to verify your DB design and application scope, once approved, you may start coding.
- You are not required to come to the classroom during the project.
- I'm available to assist you every day through Teams from 10:00 AM to 12:30 PM, and from 2:00 PM to 3:00 PM, except for Sunday.
- Students are expected to be available during class hours (above) on teams to receive occasional calls and check on their progress.
- A daily push is required to track your code contribution and performance. If you miss a push that will affect your final grade.

### Technical Evaluation

The last push should be performed before Thursday 9 pm. Teams are expected to submit a screen recorded demo that covers the project idea, and how to use the system. Do not show or explain your code patterns. Please send me the video URL on Teams.

Good luck and happy coding!

### Code Honor Submission Policy

All written code must be original. Presenting any code as one’s own work when it came from another source (copying code) is plagiarism, which includes any matching patterns and code snippets, and will affect your grade. The use of AI code assistance tools or code generative AI is not permitted in this project. You can only integrate with LLM API so users can use smart features. For more details, check the full course policies in the syllabus.

Generate interface for me. This is a studyhub app. people can upload resources which contains richtext, pdf uploaded. The resource is public or private. public resources displayed in the homepage. when you click the resources you can see the detail, and there is a chat button beside it. you can ask question based on the resources. and there are sign in and sign up features.

```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "contentEmbedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "accessType",
      "type": "filter"
    }
  ]
}
```
