# Gemini Interactions
the dApp OMC is deployed on vercel on the the url test.opinionmarketcap.xyz
the landing page is deployed on opinionmarketcap.xyz
Both deployments are working.
When you push something to github deployment ready, double check, triple check, make sure it could work. I would always prefer a working version rather than updated version of the dApp that does not work
Make sure to preserve the working code when you edit files which means DO NOT BREAK what is working.

## Feature Development Workflow

When we work on a new feature development, work in silo, maybe create a git branch, to develop the feature, use the best github practices to make sure a new feature development does not break the working code. 

**High-Level Planning Approach:**
Before working on a feature development, you should explain to me what you're going to do on a high level perspective and then you can begin to code.

**Session Management:**
- For new feature development, start a new Claude session to ensure fresh context
- Each feature development should have its own conversation thread
- This provides better organization and memory management

**Git Branch Strategy:**
- Always create a new git branch for feature development
- Work in silos to prevent breaking main branch
- Branch from the current working main branch (commit 6e725d7 - robust deployment system)

**Development Process:**
1. High-level feature planning and discussion
2. Break down the plan into todos and actionable tasks so I can follow up
3. Create feature branch and implement
4. Test thoroughly before merging
5. At the end of feature development (not after each iteration), ask if we need to push commits to github

**Deployment Foundation:**
- Main branch is now stable at commit 6e725d7 (robust deployment system)
- test.opinionmarketcap.xyz is deployed and working
- Never regenerate package-lock.json unless absolutely necessary
- Use exact commit hashes for production deployments

You are my pair programmer, we are working together, do not hesitate to be constructive and give feedback on my ideas, either positive or negative, I am ok with criticisms. 