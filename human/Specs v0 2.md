specs v0.2

we have made a first preliminary version, now we want to do a second version

we develop v0.2
goals: cover the end-to-end Story Builder process
- refine forms template and fonts use (+ minor tweaks)
- implement "Detailed Story" form: 3 more fields
- implement "Full Story": 2 more fields
- implement the end-to-end flow

# Review/refine Story Buidler forms model/template

Each form in the Story Builder has the same behavior and presentation

Rules:
- Each form has fields
- Each field has:
    - a title
    - an explainer text (do not show "explainer text")
    - a static advice (foldable/maskable, folded/masked by default, do not show show "static advice")
    - a status drop down (each value has its own emoji, I let you choose)
- For each field in the left pane, reflect in real-time the changes happening to the right pane "Your Story", and vertically align (free text and status selector)

Remove any "validate" or "next step" button, as we have the navigation above

# Update fonts in the design system

Use more classy and stylish fonts
Use more variance in font presentations (size, emphasis, color, etc.)

# Story Builder: add Detailed and Full Story forms/waves (steps in the build process)

Keep the "Progress & Navigation bar" as it is, but all cards must be active:
- "Basic Story", Setup the mandatory and fundamental building blocks
- "Detailed Story", Enrich with depth and "connection"
- "Full Story", Add the finishing touch

given the user is on the Story Builder page
when the use clicks on any card/step
then the display below switches to the corresponding form

## "Detailed Story", Enrich with depth and "connection"

title:
Empathy

explainer text:
What the Target sees, feels, hears, and says — step into their shoes

static advice:
What does your hero see in their day-to-day? What do they feel? What do they hear from colleagues, customers, or the market? What do they say about their situation? This is wher the "connection" happens between the storyteller and the audience.


title:
Consequences

explainer text:
How the Problem impacts the target's daily life, the pain that is felt

static advice:
How painful is this Problem, really? What happens to your hero because of this Problem? How does it affect their daily work, their relationships, their results? What does life look like if nothing changes?


title:
Benefits

explainer text:
The qualitative advantages your Solution provides. What does your hero gain? Hopw does your Solution relieve the Target?

static advice:
What are the real advantages your Solution gives the Target? Not features — but outcomes. What changes for them? What do they gain, recover, or feel differently about? What's the impact?


## "Full Story", Add the finishing touch

title:
Context

explainer text:
Set the scene! The environment in which the Target operates — location, industry, time, anything that the audience understand how the Target will unergo transformation.

static advice:
Describe the universe your Target lives and works in. What is happening in their industry, market, or daily environment? What makes this story relevant right now?


title:
Why

explainer text:
The core motivation or guiding principle of this story. What changes the Target's world? Whatt's their guiding light during this Story? What drives this story at its deepest level?

static advice:
What is the deeper purpose behind what you're building? Why does this matter beyond the transaction? What transformation — in your Target, in your company, in the world — are you ultimately working toward?
Warning: The most difficult part. Craft it carefully. This must not kill the vibe or momentum you have created.


# Step-specific Progress bar

Make each card/block progress bar active, at the bottom:
- "Basic Story", three steps that are Target, Problem, Solution
- "Detailed Story", three steps that are Empathy, Consequences, Benefits
- "Full Story", two step that are Context and Why

given the user is on one of the forms of the Story Builder
when they start to fill a field (non-empty)
then the interface shows the field as done/filled in its progress bar, with the status emoji, it must be accessible (color-blinds, low vision, etc.)


# Revise/update interface text for form 1: "Basic Story"

title:
Target

explainer text:
Describe the person at the centre of your story. Who are they? What role do they play? Prepare audience for the kind of change will they go through.

static advice:
Every story needs a hero — the person who will be most changed by your solution. The more specifically you define this person, the more powerfully your story will connect with the real people it is for.


title:
Problem

explainer text:
What problem, challenge, or pain does your Target face? Be specific and concrete. Turn sentence in positive form, not "the lack of" Solution.

static advice:
No problem, no story. The Problem (or antagonism) is the engine of your narrative. A good story has a good villain. It must be real, specific, and felt — not a vague pain point, but the actual thing that drives their frustration.


title:
Solution

explainer text:
How does your product, service, or business offering address the Problem for the Target? Focus on the what. Minimalise the description of the Solution in only one short, precise sentence.

static advice:
The solution should arrive like a breath of fresh air after the tension of the problem. Keep it short. The goal is relief, not a product demo. Curiosity is your friend here.


# Story title

Add a "Story title" widget below the "Story Builder" page title, above the process progress cards
- must be editable whenever the user want
- assign default a dummy and random title, still serious


# Update the cards design template

Remove the "Wave n" from the navigation cards
Each label that show if a field is empty or filled, should also have an emoji reflect the status drop down selector, must be accessible

# Update README

Remove sections:
- Lean Storytelling web app (MVP)
- Run locally
- Quickstart and public review


