Lean Storytelling: specs v0.3

# Context

We have made a 2nd version that covers the end-to-end Story Builder process.

In this document, we focus on the development v0.3, with new features and new architecture.

# Goals (high-level)

The major goal is to move app from local to public internet, add security and reliability, account and "Stories" management, still learning and having fun:

- move and re-architecture web app:
    - adapt from static/local app to public internet
    - manage server-side storage
    - choose modern architecture
    - use only free/opensource dependencies
    - keep app modern, elegant, minimalistic, lighweight, easy and fun to maintain, from a techie pov
    - secure by default, encrypt all you can (right balance)
    - keep all data (local and/or server) in case of crash/close/failure
    - define the front and back separation and flows
    - choose API strategy (REST, GraphQL, gRPC, etc.): tech, speed, reliability, security, support, popularity, maintenance
    - document how to deploy and operate:
        - for beginners
        - locally on a Linux (or macOS) computer
        - on generic CSPs like Scaleway or OVH (use & play with Docker?)
- new valuable storywriting features
    - implement secure yet simple Account CRUD features (subscription wall, modern frictionless & balanced onboarding)
    - implement basic Stories List and Versioning (many Stories per user, and many versions per Story)

# Tech details: dev and ops

Help me with this part!

Goals:

I want to design and code an app properly, and have fun and learn to build, deploy, operate, maintain an app via vibe coding

Roles:

You are an senior architect, senior full stack dev, senior ops/devops

Actions:

- detail and polish this plan
- ask me questions and explain the tradeoffs
- a non-coder like me should be able to understand/learn, and validate what you do

Success Criteria:

I can deploy an app on a public server, and run user tests in my network

## Here is the plan to review and refine
Today in v0.2:

- The app runs locally in the browser
- Data is stored there
- No sharing, no persistence across devices
- No backup/recovery

Target in v0.3:

- The app is accessible via a public URL
- The app is deployable and testable on my laptops (Ubuntu, macOS)
- User can CRUD their account, with safe password policies
- Users can save and continue their work safely whatever the place and device
- Data is kept secure and safe even if browser closes or crashes
- System is simple, low-cost, secure, documented, and maintainable

Simplicity:

We deliberately want and need to avoid complexity:

- no Kubernetes and the likes
- no heavy backend and complex micro-architecture
- maybe Docker is the way to go for local (functional test) and internet (prod) deployments?

Standard architecture:

I suggest this architecture, but roast me (say what's good, suggest improvements):

```
Browser (Frontend) -> (HTTPS API calls) -> Backend (API) -> Database (persistent storage)
```

Provider:

For each arch tier, help me choose a free or cheap, and easy provider

Storage:

Choose a secure yet simple and reliable storage strategy: local, cache, server, CDN, sync, backup, etc.

Safety, reliability:

Design a safe system in front of unvoluntary actions, crashes, network failures, data loss, etc.

Craft an automated backp and restore policy

Security:

Make this app as secure as its maturity

At a later stage, we plan to bill users

You refine & I learn:

- Ask me all questions to clarify
- Challenge me
- Suggest things
- Explain me, as I want to understand and learn
- We are pairing in some way

# Functional

Goals:

- design/construct an onboarding with  minimal friction
- allow the user to produce some effort, but focused on core value: story creation/crafting and stories management (I want to ease the user pain/friction for supporting/secondary features) 
- simple but extensible system

Roles:

You are an expert product manager, expert UX/UI designer

Actions:

- peer review this plan below
- ask questions to clarify
- a non-coder like me should be able to understand/learn, and validate what you do

Success Criteria:

the UX and workflow allow users to create and manage their Stories, reliability, securely, on any large screen device

## Customer journeys

- Anonymous user:

```
Discover/visit → Start Story Building → Edit/review loops
```

Only access to Story Builder, with the three-form workflow, only on one live Story that can changed/edited forever, but never saved nor versionned

- Identified and authenticated user

```
Discover/visit → Start Story Building → Edit/review loops → Save Stories → Manage Stories and Versions / Update Profile
```

Access to Story Builder, Story Management, Profile

## Let users try and get some value before account creation for free

Allow anonymous users to use Story Buidler: only one Story that they can edit and overwrite forever, no save, no version.

Warn somehow the user that nothing is saved if they don't create their account ut we apply no usage limitation. Informe the user that with an account they have access to Story Management and Versionning.

CTA on top right of app to login or signup.

## Account CRUD

Questions and doubts, discussion to have with the architect/devops AND the designer:

- Create account (easy, fast, frictionless): input valid email address, input secure password (standard policy), confirm password (check). Store encrypted passwords in a secure DB
    - And then, can we simply create a "Reset password" form? I guess this would need the ability for the backend to send emails (that ar enot caught as spam or malicious): how to do this simply and cheap, and what are the pros and cons?
- But then, if we have the capability to send emails from the backend, can we switch to a "magic link" UX?
- What are the pros and cons to each approach? What are the tradeoffs at this stage/maturity of this project?

Add a CTA to Update profile: with job and intent capture.

Destroy account with all data (no export/save, encourage copy-paste).

## Stories List and Versioning

The features and behaviors I want to offer: allow the user to crate and manahe multiple Stories, and multiple versions of each Story

- Create a Story: opens a new empty Story Buidler 
- Edit a Story: opens the Story Builder with the latest version of the Story
- Delete a Story: empty all the Story Builder fields, remove Story from the list along with all versions of this Story
- Create a new +1 version from the latest version of an existing Story (add version +1 of this Story)
- Copy or fork of any version of an existing Story, as as a version 1 of a new Story
- Delete any version of a Story

I want to discuss the UX and UI

## Minor tweaks

Make a left foldable sidebar

Add a top bar, with the app title "Lean Storytelling", and fake buttons on right end "Sign up", "Log in"

Change text from
"
Lean Storytelling
Build your story — one element at a time.
"
to
"
Story Builder
Build your story — one element at a time.
"



# To do after implem + deploy

After your full implementation of this version, my tests and validation, remind me to use/experiment spec-kit extensions:

- document
- learn

