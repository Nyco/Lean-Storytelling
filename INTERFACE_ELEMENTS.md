# Lean Storytelling Interface Elements

## Global Structure

### App Header / Top Bar
- **App Title**: "Lean Storytelling" (main title in header)
- **Auth Navigation**: Login/Signup buttons and profile/logout buttons

### Story Builder Context Bar
- **Story Builder Heading**: "Story Builder" title
- **Story Title Display**: Shows the current story title
- **Story Title Input**: Input field for editing the story title
- **Save Button**: Button to save the story

### Wave Navigation Bar
- **Wave Cards**: Cards representing different story-building phases
  - **Basic Story Wave Card**: First wave for fundamental building blocks
  - **Detailed Story Wave Card**: Second wave for enriching the story
  - **Full Story Wave Card**: Third wave for finishing touches
- **Wave Progress**: Progress indicators within each wave card
  - **Wave Steps**: Individual steps within each wave (e.g., Target, Problem, Solution)
  - **Wave Step Labels**: Labels for each step (e.g., "Target", "Problem")
  - **Wave Complete Badge**: Checkmark badge indicating wave completion

### Stories Sidebar
- **Sidebar Header**: Contains "My Stories" title and "New Story" button
- **Sidebar List**: List of user's stories
- **Sidebar Toggle**: Button to toggle sidebar visibility

### App Container
- **Left Pane**: Input form section
  - **Pane Label**: "Craft" label for the left pane
  - **Form View**: Main form area for story input
  - **Storage Notice**: Warning about session storage unavailability
  - **Basic Story Form**: Form for basic story elements (Target, Problem, Solution)
  - **Detailed Story Form**: Form for detailed story elements (Empathy, Consequences, Benefits)
  - **Full Story Form**: Form for full story elements (Context, Why)
  - **Field Groups**: Groups of fields for each story element
    - **Field Title**: Title of the field (e.g., "Target", "Problem")
    - **Field Explainer**: Explanation text for the field
    - **Textarea**: Input area for the field content
    - **Field Advice**: Advice section with toggle
    - **Field Advice Toggle**: Button to toggle advice visibility
    - **Field Advice Body**: Content of the advice section
    - **Status Select**: Dropdown for confidence level (Unsure, Needs Review, Confirmed)

- **Right Pane**: Story preview section
  - **Pane Label**: "View" label for the right pane
  - **Story Preview**: Preview of the story
  - **Preview Heading**: "Your Story" heading
  - **Preview Narrative**: Narrative preview text
  - **Preview Placeholder**: Placeholder text for empty story
  - **Consistency Check**: Placeholder for consistency analysis (coming soon)
  - **Coaching**: Placeholder for coaching questions (coming soon)

### Profile Section
- **Profile Form**: Form for editing user profile
  - **Job Title Input**: Input for job title
  - **Intent Input**: Input for what the user wants to get better at
  - **Save Changes Button**: Button to save profile changes
- **Profile Danger**: Section for deleting account
  - **Delete Account Button**: Button to delete account

### Modals
- **Auth Modal**: Modal for login/signup
  - **Auth Form**: Form for entering email
  - **Magic Link Button**: Button to send magic link
- **Onboarding Modal**: Modal for new user onboarding
  - **Onboarding Form**: Form for user role and intent
  - **Save and Continue Button**: Button to save onboarding info
  - **Skip Button**: Button to skip onboarding
- **Delete Account Confirmation Modal**: Modal for confirming account deletion
  - **Delete Confirm Input**: Input for confirming deletion
  - **Delete Confirm Button**: Button to confirm deletion
  - **Cancel Button**: Button to cancel deletion
- **Confirmation Modal**: Reusable modal for confirmations
  - **Confirm Yes Button**: Button to confirm action
  - **Confirm No Button**: Button to cancel action
- **Story Title Prompt Modal**: Modal for naming a new story
  - **Title Form**: Form for entering story title
  - **Create Button**: Button to create story

### Other Elements
- **Sync Indicator**: Indicator for sync status
- **Read-only Banner**: Banner for viewing older versions of a story
  - **Fork Button**: Button to fork an older version
