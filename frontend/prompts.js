/* prompts.js — Curated coaching prompts for the Lean Storytelling app
   Static data only. No external dependencies.
   Each bucket contains at least 5 open-ended prompts.
   ------------------------------------------------------------------ */

const PROMPTS = {

  target: {
    default: [
      'Who exactly is this person? What do they do day-to-day?',
      'What does a typical day look like for your Target?',
      'What does your Target care most about in their work?',
      'How would your Target describe themselves in their own words?',
      'What does success look like for your Target in their role?',
      'What are the goals your Target is measured against?',
    ],
    unsure: [
      'How could you test whether this is the right audience for your story?',
      'Who could you talk to this week to validate this Target?',
      'What would change in your story if your Target turned out to be different?',
      'What evidence do you have — or could you gather — that this Target exists?',
      'What is the riskiest assumption you are making about this Target?',
    ],
    'needs-review': [
      'What specific detail could make this Target feel more real and concrete?',
      'Is there a narrower segment of this audience your story serves best?',
      'What would someone who knows this audience say is missing from your description?',
      'How might this Target be different in six months than they are today?',
      'What context or environment shapes how this Target thinks and acts?',
    ],
    confirmed: [
      'What surprised you most when you validated this Target?',
      'What nuance about this Target does your story not yet capture?',
      'How does this Target compare to the second audience your solution serves?',
      'What do you know about this Target that your competitors do not?',
      'How will this Target evolve, and how does your story account for that?',
    ],
  },

  problem: {
    default: [
      'What makes this problem painful enough that someone would seek a solution?',
      'How long has this problem existed for your Target?',
      'What has your Target tried before, and why did those attempts fall short?',
      'What does it cost your Target — in time, money, or energy — to live with this problem?',
      'How does your Target talk about this problem in their own words?',
      'What would life look like for your Target if this problem disappeared tomorrow?',
    ],
    unsure: [
      'How would you confirm that this problem is real and not just perceived?',
      'Who experiences this problem most acutely, and have you spoken with them?',
      'What would prove this problem is significant enough to act on?',
      'What is the most common objection to the idea that this is actually a problem?',
      'What data or observation first made you believe this problem existed?',
    ],
    'needs-review': [
      'Is this problem a symptom of a deeper root cause worth naming?',
      'How could you make the consequences of this problem more vivid?',
      'What emotional dimension of this problem are you not yet capturing?',
      'How does this problem connect directly to what your Target cares about most?',
      'What would a sceptical audience challenge about this problem statement?',
    ],
    confirmed: [
      'What do you know about this problem that is not obvious from the outside?',
      'How has your understanding of this problem deepened since you first named it?',
      'What aspect of this problem do most people underestimate?',
      'How does the scale or frequency of this problem vary across different Targets?',
      'What related problems sit just outside the scope of your story?',
    ],
  },

  solution: {
    default: [
      'How does your Solution make the Problem go away — or at least better?',
      'What is the one thing your Solution does that nothing else does?',
      'What does your Target gain by choosing your Solution?',
      'What is the first tangible result someone experiences after adopting your Solution?',
      'How long does it take for the Solution to deliver its main benefit?',
      'What does "success" look like after your Target has used your Solution?',
    ],
    unsure: [
      'How could you test whether your Solution actually solves the Problem you described?',
      'What is the simplest version of this Solution you could put in front of someone today?',
      'What assumption about your Solution are you most nervous about?',
      'Who has already benefited from something like your Solution, and what did they say?',
      'What would falsify the belief that your Solution works?',
    ],
    'needs-review': [
      'What makes your Solution credible to someone who has never heard of it?',
      'How could you make the outcome of your Solution more concrete and measurable?',
      'What objection does your Solution not yet address?',
      'How does your Solution connect back to the specific pain you named in the Problem?',
      'What evidence or proof point would strengthen your Solution statement?',
    ],
    confirmed: [
      'What unexpected benefit have users discovered in your Solution?',
      'How has your Solution evolved based on what you have learned from users?',
      'What limitation of your Solution are you most honest about?',
      'How would you describe your Solution to someone in a completely different industry?',
      'What is the next capability your Solution needs to serve your Target even better?',
    ],
  },

};
