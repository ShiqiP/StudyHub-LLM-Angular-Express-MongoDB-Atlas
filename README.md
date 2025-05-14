

# StudyHub (LLM + Angular + Express + MongoDB Atlas)

<img controls src="demo.gif" title="Title"></img>

This is a full-stack web application that integrates Large Language Models (LLMs) with modern web technologies(Angular19, Express and MongoDB Atlas) to provide intelligent document and file management.

## features
🔐 Authentication
- Secure user authentication using JWT and bcryptjs

- Supports sign-up and sign-in functionality

📚 Resource Management
- Create, delete, and manage rich text content and file uploads/downloads

- All content is embedded and indexed using vector embeddings for semantic search

🤖 AI-Powered Features
- Smart Recommendations: Suggests 3 relevant resources based on vector similarity using a custom vector index in MongoDB

- Question Answering: Users can ask natural language questions, and the system returns answers based on stored resources using LLM prompting

🧠 Vector Indexing
- Custom vector index with cosine similarity on contentEmbedding field (1536 dimensions)

- Supports access control with accessType filter


## how to run this project
1. Set Up Environment Variables

Create a .env file in the /backend directory with the following content:

```
ATLAS_MONGODB_URL = 
ATLAS_MONGODB_APPNAME = 
ATLAS_MONGODB_USERNAME =   
ATLAS_MONGODB_PASSWORD = 
ATLAS_MONGODB_DBNAME = 
OPENAI_API_KEY = 
SECRET = FinalMWAProject # for password encryption
```
2. Set Up MongoDB Atlas 
- Create a free cluster
- White list your IP and create a database user
- Copy the connection string into ATLAS_MONGODB_URL

3. Create Vertor Index in MongoDB Atlas
Create a vector index named "resource_vector_index" with the following configuration:

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

4. Set Up OpenAI API
- Subscribe to a paid plan
- Create new secret key and assign it to "OPENAI_API_KEY" 

5. Configure CKEditor 5
- Sign up at CKEditor for a free 14-day trial
- Add your CKEditor license key to:
"/frontend/src/environments/environment.ts"

(I will replace a free library in the future)


## database migration
```bash
npm run migrate
```

If you don't specify your database, mongoDB automatically assign a "test" database for you.