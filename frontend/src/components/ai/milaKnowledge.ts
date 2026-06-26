/* ══════════════════════════════════════════════════════════
   MILA LOCAL KNOWLEDGE ENGINE
   No API key needed — all responses live here.
   Scoring: count how many pattern tokens appear in the user's
   normalised input; longer patterns weigh more.
══════════════════════════════════════════════════════════ */

export interface KnowledgeEntry {
  id: string;
  topic: string;
  patterns: string[];
  response: string;
}

export const KNOWLEDGE: KnowledgeEntry[] = [

  /* ── Greetings / meta ─────────────────────────────────── */
  {
    id: 'greeting',
    topic: 'general',
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'greetings'],
    response: `Hi there! 👋 I'm **Mila**, your PrecastFlow assistant.

I can help you with anything in the system — pages, features, workflow stages, permissions, file uploads, KPIs, and more. Just ask!

Here are some things you can ask me:
1. "How do I create a task?"
2. "What can a Member role do?"
3. "How does version control work for files?"
4. "Explain the Kanban workflow stages"`,
  },

  {
    id: 'what-can-you-do',
    topic: 'general',
    patterns: ['what can you do', 'help me', 'what do you know', 'what are you', 'who are you', 'your purpose', 'what is mila'],
    response: `I'm **Mila**, the built-in help assistant for PrecastFlow 🏗️

I can explain anything about the system:
- **Pages** — Dashboard, Tasks, Kanban Board, Team KPIs, Members, Activity, Profile
- **Features** — Task management, File version control, Notifications, Comments
- **Workflow** — The 10 design stages from New Request → Issued to Factory
- **Permissions** — What Admins, Managers, and Members can each do
- **How-to guides** — Step-by-step instructions for any action

Just ask your question in plain language and I'll guide you through it!`,
  },

  /* ── Dashboard ────────────────────────────────────────── */
  {
    id: 'dashboard',
    topic: 'dashboard',
    patterns: ['dashboard', 'home page', 'overview page', 'main page', 'stats cards', 'home screen'],
    response: `The **Dashboard** is your at-a-glance command center. Here's what you'll find:

**Stats Cards (top row)**
- Total Tasks, Completed (+ % rate), Pending, Overdue
- Team Members count (Managers & Admins only)

**Charts**
- **Weekly Task Completions** — area chart of output over 7 days
- **Tasks by Status** — donut chart across all workflow stages
- **Priority Breakdown** — bar chart (Urgent / High / Medium / Low)
- **Tasks by Member** — workload split across the team (managers/admins only)
- **Recent Activity** — the last 8 team events with avatars and timestamps

Everything on the Dashboard is read-only — it's a live summary that refreshes each time you visit.`,
  },

  /* ── Tasks page ───────────────────────────────────────── */
  {
    id: 'tasks-page',
    topic: 'tasks',
    patterns: ['tasks page', 'task list', 'list view', 'my tasks', 'tasks view', 'tasks screen'],
    response: `The **Tasks** page shows all tasks in a scrollable list, split into two sections:

1. **Active Tasks** — everything not yet Approved or Issued
2. **Approved & Issued** — completed work (greyed out, at the bottom)

**Filter bar** at the top lets you:
- Search by keyword (title or description)
- Filter by stage, priority, or assignee
- Sort by newest, oldest, due date, title, or priority

Each task card shows: priority badge, assignee avatar, due date, tags, and a quick **advance stage** button.

Click any card to open the full **Task Detail** panel with Comments, Files, and Activity tabs.`,
  },

  /* ── Create task ──────────────────────────────────────── */
  {
    id: 'create-task',
    topic: 'tasks',
    patterns: ['create task', 'add task', 'new task', 'make task', 'how to create', 'create a task', 'add a task', 'new task button'],
    response: `Only **Admins and Managers** can create tasks. Here's how:

1. Click the **New Task** button (top-right on the Tasks page, or on the "New Requests" column header in Kanban)
2. Fill in the form:
   - **Title** (required)
   - **Description** (optional but recommended)
   - **Status** — defaults to "New Request"
   - **Priority** — Urgent / High / Medium / Low
   - **Due Date**
   - **Assign To** — pick a team member
   - **Tags** — type a tag and press Enter to add it
3. Click **Create Task**

The task will immediately appear in the **New Requests** column on the Kanban board.`,
  },

  /* ── Edit task ────────────────────────────────────────── */
  {
    id: 'edit-task',
    topic: 'tasks',
    patterns: ['edit task', 'update task', 'change task', 'modify task', 'edit task details', 'who can edit'],
    response: `**Task detail editing** (title, description, priority, due date, assignee, tags) is restricted to **Admins and Managers only**.

To edit a task:
1. Open any task (click its card)
2. Click the **Edit Task** button in the top-right of the detail panel
3. Update the fields you need
4. Click **Save Changes**

**Members** can only update the **stage/status** of tasks assigned to them — they cannot change other details. They can also upload files and add comments.`,
  },

  /* ── Delete task ──────────────────────────────────────── */
  {
    id: 'delete-task',
    topic: 'tasks',
    patterns: ['delete task', 'remove task', 'trash task', 'delete a task'],
    response: `Only **Admins and Managers** can delete tasks.

To delete a task:
1. On the **Tasks** page (list view), hover over a task card
2. The red **trash icon** appears in the top-right corner of the card
3. Click it — you'll see a confirmation prompt
4. Confirm to permanently delete the task

⚠️ Deletion is permanent and removes all associated comments and files. Use it carefully.`,
  },

  /* ── Task priorities ──────────────────────────────────── */
  {
    id: 'priorities',
    topic: 'tasks',
    patterns: ['priority', 'urgent', 'high priority', 'low priority', 'medium priority', 'task priority', 'priorities'],
    response: `Each task has one of four **priority levels**:

- 🔴 **Urgent** — drop everything, needs immediate attention
- 🟠 **High** — important, should be addressed soon
- 🟡 **Medium** — standard priority (default)
- 🟢 **Low** — can wait; do when capacity allows

The priority appears as a coloured badge on every task card and determines the colour of the left accent bar on list-view cards.

You can **filter** the Tasks page by priority using the filter bar at the top.`,
  },

  /* ── Move / change stage ──────────────────────────────── */
  {
    id: 'move-stage',
    topic: 'workflow',
    patterns: ['move task', 'change stage', 'advance stage', 'next stage', 'move to', 'change status', 'update status', 'progress task', 'how to move', 'move forward'],
    response: `There are three ways to advance a task through the workflow:

**Option 1 — Quick button on task card**
Each card has a **next stage →** button at the bottom right. Click it to move the task one step forward instantly.

**Option 2 — Move buttons inside the Kanban card**
On the Kanban board, each card has **← back** and **→ forward** buttons in the footer. Use these to move one step in either direction.

**Option 3 — Edit the task**
Open the task detail, click **Edit Task**, change the **Status** dropdown to any stage, then save.

⚠️ Moving to **Approved for Production** or **Issued to Factory** requires a Manager or Admin role.`,
  },

  /* ── Kanban board ─────────────────────────────────────── */
  {
    id: 'kanban',
    topic: 'kanban',
    patterns: ['kanban', 'kanban board', 'workflow board', 'design board', 'board view', 'columns', 'kanban columns'],
    response: `The **Kanban Board** (called "Design Workflow Board" in the nav) shows all tasks as cards in 10 columns — one column per workflow stage.

**Reading the board:**
- Each column header shows the stage name, emoji icon, task count, and a progress bar showing position in the workflow
- Columns are colour-coded (grey → amber → blue → indigo → violet → orange → cyan → red → green → teal)
- 🔒 **Approved for Production** and **Issued to Factory** columns have a "Manager approval required" note — only Managers/Admins can move tasks there

**Moving cards:**
- Use the **← / →** buttons at the bottom of each card
- Or click the card to open details and edit the stage

Scroll horizontally to see all 10 columns. The **+ New** button on the "New Requests" column lets Managers/Admins create tasks directly.`,
  },

  /* ── Workflow stages ──────────────────────────────────── */
  {
    id: 'workflow-stages',
    topic: 'workflow',
    patterns: ['workflow stages', '10 stages', 'design stages', 'all stages', 'stages explained', 'what are the stages', 'workflow steps', 'list stages', 'explain stages'],
    response: `The design workflow has **10 stages**:

1. 📋 **New Request** — Request received, not yet reviewed
2. 🔍 **Under Review** — Manager checking feasibility before assigning
3. ✏️ **Concept Design** — Designer creating the initial concept
4. 🏗️ **Structural Design** — Structural engineering and calculations
5. 📐 **Shop Drawings** — Detailed fabrication/production drawings
6. 👁️ **Internal Review** — QA check before sending to client
7. 🤝 **Client / Consultant Review** — Awaiting client feedback
8. 🔄 **Revisions** — Client requested changes; after revisions → Approved
9. ✅ **Approved for Production** — Client has signed off *(Manager/Admin only)*
10. 🏭 **Issued to Factory** — Production package sent to factory *(Manager/Admin only)*`,
  },

  {
    id: 'revisions-stage',
    topic: 'workflow',
    patterns: ['revisions', 'revision stage', 'client changes', 'sent back', 'revision workflow', 'after revision', 'what happens after revisions'],
    response: `The **Revisions** stage is where a task lands when the client or consultant requests changes after reviewing the drawings.

**Typical flow:**
1. Task is in **Client/Consultant Review** → 🤝
2. Client requests changes → task is moved to **Revisions** → 🔄
3. Designer makes the requested changes
4. Task moves to **Approved for Production** → ✅ *(Manager/Admin clicks "Approved" button)*

The "→ next stage" button on a Revisions card shows **Approved for Production** — only Managers/Admins can click it.

If major rework is needed, a Manager can manually move the task back to **Shop Drawings** or **Structural Design** using the Edit Task form.`,
  },

  {
    id: 'approved-issued',
    topic: 'workflow',
    patterns: ['approved for production', 'issued to factory', 'final stage', 'approve task', 'how to approve', 'issue to factory', 'final approval'],
    response: `The last two stages are gated and require **Manager or Admin** access:

**✅ Approved for Production**
- Means the client has formally approved the design
- To move here: Manager opens the task on the Kanban board and clicks the **"Approved for Production →"** button, or edits the task and changes the status

**🏭 Issued to Factory**
- Means the final production package has been sent to the factory
- To move here: Manager/Admin clicks **"Issued to Factory →"** from the Approved card

Regular Members cannot move tasks into either of these stages — this ensures only authorized personnel sign off on production.`,
  },

  /* ── Team KPIs ────────────────────────────────────────── */
  {
    id: 'team-kpis',
    topic: 'kpis',
    patterns: ['team kpis', 'kpi', 'performance', 'metrics', 'productivity', 'completion rate', 'efficiency score', 'leaderboard', 'top performer', 'attendance'],
    response: `The **Team KPIs** page is visible to Managers and Admins only (in the left sidebar).

**What you'll see:**

**12 KPI tiles:**
Total Members · Active Members · Online Now · Tasks Completed · Completion Rate · Overdue Tasks · In Progress · Avg Completion Time · Productivity Score · Team Efficiency · New Members This Month · Tasks Assigned

**Visual widgets:**
- 🏆 **Top Performer** card with a radial score ring
- 📊 **Workload Distribution** stacked bar chart (Completed / In Progress / Overdue per person)
- 📋 **Member Leaderboard** — sortable table with individual scores for every team member
- 📍 **Recent Team Activity** at the bottom

Scores are calculated from completion rates, overdue ratios, and activity attendance.`,
  },

  /* ── Members page ─────────────────────────────────────── */
  {
    id: 'members-page',
    topic: 'members',
    patterns: ['members page', 'team members', 'members list', 'view members', 'manage members', 'members section'],
    response: `The **Members** page (sidebar → Members) is accessible to Managers and Admins only.

It shows a card grid of all team members, each displaying:
- Profile photo (or initial avatar)
- Full name, email, bio
- Role badge (Admin / Manager / Member)
- Status badge (Active / Inactive)
- Edit / Delete buttons on hover *(Admins only)*

**Filters at the top:**
- Search by name or email
- Filter by role: All / Admin / Manager / Member

**Add Member** button (top-right, Admins only) — opens a form to invite a new team member.`,
  },

  {
    id: 'add-member',
    topic: 'members',
    patterns: ['add member', 'invite member', 'create member', 'new member', 'add user', 'add team member'],
    response: `Only **Admins** can add new team members. Here's how:

1. Go to **Members** in the sidebar
2. Click **Add Member** (top-right)
3. Fill in the form:
   - **Name** and **Email** (required)
   - **Role** — Admin / Manager / Member
   - **Status** — Active / Inactive
   - **Password** (the member uses this to log in)
   - **Avatar URL** and **Bio** (optional)
4. Click **Add Member** to save

The new member can immediately log in at the login page using the email and password you set.`,
  },

  /* ── User roles ───────────────────────────────────────── */
  {
    id: 'roles-overview',
    topic: 'roles',
    patterns: ['roles', 'permissions', 'role difference', 'admin vs manager', 'what role', 'user roles', 'access control', 'who can', 'role based'],
    response: `PrecastFlow has three roles with different access levels:

**👑 Admin — Full access**
Create/edit/delete tasks, manage all team members (add/edit/delete), approve tasks, issue to factory, view all pages and data

**⚡ Manager — Team management**
Create/edit tasks, view Team KPIs, view and edit members (cannot delete Admins), move tasks to Approved/Issued stages, view all tasks

**👤 Member — Assigned work only**
View tasks assigned to them, update the **stage** of their assigned tasks only (cannot edit title/description/priority/dates/assignee), upload and download files, add comments. Cannot access Members, Team KPIs, or Activity Log pages.`,
  },

  {
    id: 'member-permissions',
    topic: 'roles',
    patterns: ['what can member do', 'member role', 'member permissions', 'member access', 'member can', 'regular user', 'member only'],
    response: `A **Member** has the most restricted access — focused on their own assigned work:

✅ **Can do:**
- View tasks that are assigned to them
- Change the **stage/status** of their own assigned tasks (except moving to Approved or Issued — those need a Manager)
- Upload files to their tasks and download any version
- Add and view comments on their tasks
- View the Dashboard and their own Profile

❌ **Cannot do:**
- Edit task title, description, priority, due date, tags, or assignee
- Create new tasks
- Delete tasks
- Access the Members page, Team KPIs, or Activity Log
- Move tasks to "Approved for Production" or "Issued to Factory"

If a Member needs to change a task detail, they should ask a Manager or Admin to edit it.`,
  },

  /* ── Activity log ─────────────────────────────────────── */
  {
    id: 'activity',
    topic: 'activity',
    patterns: ['activity', 'activity log', 'audit trail', 'history', 'who did', 'event log', 'action log', 'audit log'],
    response: `The **Activity Log** page (sidebar → Activity) is visible to Managers and Admins only.

It shows a chronological list of every action taken in the system:
- Task created / status changed / completed
- Files uploaded or deleted
- Comments added
- Members added, updated, or removed
- Task assignments

Each entry shows: action icon, description, user avatar, and timestamp.

**Load more** button at the bottom fetches older records (loads 50 at a time).
**Refresh** button (top-right) pulls the latest events.

For a single task's history, open the task detail and click the **Activity** tab.`,
  },

  /* ── Profile ──────────────────────────────────────────── */
  {
    id: 'profile',
    topic: 'profile',
    patterns: ['profile', 'profile settings', 'my profile', 'account settings', 'personal settings', 'user settings'],
    response: `The **Profile Settings** page (sidebar → Profile) lets you personalise your account.

**What you can change:**
- **Display Name** — shown throughout the app
- **Bio** — short description (appears on your member card)
- **Profile Photo** — upload, change, or remove your avatar
- **Password** — requires your current password to change

Everything applies to your own account only — you cannot change other users' profiles from here.`,
  },

  {
    id: 'change-photo',
    topic: 'profile',
    patterns: ['profile photo', 'avatar', 'profile picture', 'change photo', 'upload photo', 'remove photo', 'profile image', 'upload avatar'],
    response: `To upload or change your profile photo:

1. Go to **Profile** in the sidebar
2. Click the **profile photo** (the avatar circle at the top) — a camera icon appears on hover
3. Or click the **Upload Photo** / **Change Photo** button below the avatar
4. Choose an image file: **JPG, PNG, or WebP**, max **5 MB**
5. A preview appears immediately — you'll see a small green badge confirming a new photo is staged
6. Click **Save Changes** to apply

To **remove** your photo, click the red **Remove** button that appears next to "Change Photo" when a photo is set. Then save.

Your new photo appears in the Navbar, Members page, Team KPIs, and Activity Feed right away.`,
  },

  {
    id: 'change-password',
    topic: 'profile',
    patterns: ['change password', 'update password', 'new password', 'reset password', 'password settings'],
    response: `To change your password:

1. Go to **Profile** in the sidebar
2. Scroll down to the **Change Password** section
3. Enter your **Current Password**
4. Enter your **New Password** (min 6 characters)
5. Click **Save Changes**

If you've forgotten your current password, contact your Admin — they can set a new password for you from the Members page.`,
  },

  /* ── File management ──────────────────────────────────── */
  {
    id: 'file-management',
    topic: 'files',
    patterns: ['file', 'files', 'file management', 'documents', 'attachments', 'file upload overview', 'manage files'],
    response: `Every task in PrecastFlow has a **Files tab** with full version control — ideal for managing engineering drawings through design iterations.

**What you can do:**
- Upload any design file (PDF, DWG, DXF, Word, Excel, images, ZIP)
- Each upload creates a new **version number** (v1.0, v1.1, v2.0…)
- Add **Change Notes** to describe what changed in each version
- **Preview** images and PDFs inline without downloading
- **Download** any version at any time
- See who uploaded each version, when, and at which stage

Open any task → click the **Files** tab to access all of this.`,
  },

  {
    id: 'upload-file',
    topic: 'files',
    patterns: ['upload file', 'attach file', 'add file', 'upload document', 'upload drawing', 'how to upload', 'upload to task'],
    response: `To upload a file to a task:

1. Click the task to open its **Detail panel**
2. Click the **Files** tab
3. Drag & drop a file onto the upload zone — or click the zone to browse
4. (Optional) Add **Change Notes** describing what's new in this version
5. (Optional) Check **Major revision** to bump v1.x → v2.0 instead of incrementing minor
6. Click **Upload v1.x** (the button shows the next version number)

**Supported types:** PDF, DWG, DXF, JPG, PNG, WebP, SVG, Word, Excel, ZIP (max **50 MB**)

The file appears immediately in the **Version History** panel below.`,
  },

  {
    id: 'version-control',
    topic: 'files',
    patterns: ['version', 'versions', 'version control', 'v1.0', 'v2.0', 'file versions', 'revision history', 'previous version', 'file history'],
    response: `PrecastFlow uses automatic **version numbering** for every file upload:

- **First upload** on a task → **v1.0**
- **Each subsequent upload** → minor increment: v1.1, v1.2, v1.3…
- **Major revision** (tick the checkbox) → bumps to v2.0, v3.0, etc.

Each version records:
- File name and size
- Uploader name and avatar
- Exact date and time
- **Workflow stage** at the time of upload
- Optional change notes

The **Version History** panel in the Files tab shows all versions. The **latest** version is highlighted at the top with a "LATEST" badge. Click the arrow to expand older versions below it.

No version is ever overwritten — everything is permanently stored.`,
  },

  {
    id: 'preview-download',
    topic: 'files',
    patterns: ['preview file', 'download file', 'view file', 'open file', 'see file', 'download drawing', 'preview drawing', 'preview pdf'],
    response: `**Previewing files (PDFs and images only):**
1. In the **Files** tab, hover over any version in the history
2. Click the **eye icon (👁)** that appears on the right
3. A full-screen preview modal opens with the file rendered inline
4. Click the **Download** button inside the preview if you want to save it

**Downloading any file:**
- Hover over a version in the history and click the **download icon (↓)**
- The file saves to your computer using the original filename

Non-previewable files (DWG, DXF, Word, Excel, ZIP) show only the download button — use your desktop application to open them.`,
  },

  {
    id: 'delete-file',
    topic: 'files',
    patterns: ['delete file', 'remove file', 'delete version', 'remove version', 'delete attachment'],
    response: `Only **Managers and Admins** can delete file versions, and deletion is **permanent** — there is no undo.

To delete a file version:
1. Open the task → **Files** tab
2. Hover over the version you want to remove in the Version History
3. Click the red **trash icon** that appears on the right
4. Confirm the deletion in the prompt

The remaining versions are unaffected. The system preserves all other versions indefinitely.

⚠️ If you need to preserve all revisions for audit/compliance purposes, leave old versions in place and just upload new ones on top.`,
  },

  /* ── Notifications ────────────────────────────────────── */
  {
    id: 'notifications',
    topic: 'notifications',
    patterns: ['notification', 'notifications', 'bell icon', 'alerts', 'unread', 'notification badge', 'mark read'],
    response: `The **bell icon** in the top navbar shows your notifications.

**When you get notified:**
- A task is assigned to you
- A task you manage has a status change
- A task reaches "Approved for Production"
- A task is "Issued to Factory"
- A member is added or updated (Admins/Managers)

**Reading notifications:**
1. Click the **bell icon** → dropdown opens
2. Unread notifications have a violet dot on the left
3. Click any notification to mark it as read (navigates to the relevant task)
4. Click **Mark all read** at the top to clear all at once

The red badge number on the bell icon shows your total unread count.`,
  },

  /* ── Comments ─────────────────────────────────────────── */
  {
    id: 'comments',
    topic: 'tasks',
    patterns: ['comment', 'comments', 'add comment', 'write comment', 'comment on task', 'task comment', 'discussion'],
    response: `Every task has a **Comments** tab in its detail panel — visible to anyone who can see the task.

**To add a comment:**
1. Open a task (click its card)
2. Click the **Comments** tab
3. Type your message in the input at the bottom
4. Press **Enter** or click **Post**

**To delete a comment:**
- Your own comments: click the small **Delete** link that appears below your bubble
- Any comment: Managers and Admins can delete any comment

Comments are great for quick updates, asking questions, or flagging issues without changing the task details.`,
  },

  /* ── Assigning tasks ──────────────────────────────────── */
  {
    id: 'assign-task',
    topic: 'tasks',
    patterns: ['assign task', 'assigned to', 'assignee', 'who is assigned', 'reassign', 'assign to member', 'change assignee'],
    response: `Only **Managers and Admins** can assign or reassign tasks.

**When creating a task:**
- The **Assign To** dropdown in the create form shows all active team members
- Select a member to assign them immediately

**To change the assignee on an existing task:**
1. Open the task detail panel
2. Click **Edit Task** (top-right — only visible to Managers/Admins)
3. Change the **Assign To** dropdown
4. Click **Save Changes**

The assigned member receives a notification immediately, and the task appears in their **My Tasks** list and their column on the Kanban board.`,
  },

  /* ── Overdue / due dates ──────────────────────────────── */
  {
    id: 'due-dates',
    topic: 'tasks',
    patterns: ['due date', 'overdue', 'deadline', 'late task', 'past due', 'upcoming deadline', 'when due'],
    response: `**Due dates** help track deadlines for design tasks.

**Setting a due date:**
- Set it in the Create Task or Edit Task form using the **Due Date** date picker

**Overdue indicators:**
- Any task past its due date (not yet Approved or Issued) shows a 🔴 red date with a ⚠️ warning symbol
- The **Overdue** stat card on the Dashboard counts these tasks
- The Team KPIs leaderboard also tracks overdue tasks per member

**In the filter bar** on the Tasks page, you can sort by **Due Date ↑** to see most urgent deadlines first.

Completed tasks (Approved/Issued) don't show overdue warnings even if their due date has passed.`,
  },

  /* ── Tags ─────────────────────────────────────────────── */
  {
    id: 'tags',
    topic: 'tasks',
    patterns: ['tags', 'tag', 'label', 'add tag', 'task tags', 'categorize task'],
    response: `**Tags** let you categorise tasks with free-form labels.

**Adding tags (Managers/Admins when creating or editing a task):**
1. In the task form, find the **Tags** field at the bottom
2. Type a tag name (e.g. "block-a", "hotel-lobby", "urgent-client")
3. Press **Enter** to add it — appears as a violet pill
4. Add as many as you need
5. Click the **×** on any pill to remove it before saving

Tags appear on task cards in both the list view and Kanban board. You can use the **search** on the Tasks page to find tasks that contain a specific tag word.`,
  },

  /* ── Filtering / searching tasks ─────────────────────── */
  {
    id: 'filter-tasks',
    topic: 'tasks',
    patterns: ['filter', 'search task', 'sort task', 'find task', 'filter task', 'search for task', 'filter by'],
    response: `The **filter bar** at the top of the Tasks page gives you several ways to narrow results:

- **Search box** — type any keyword to search task titles and descriptions
- **All Stages dropdown** — filter to one specific workflow stage (e.g. "Shop Drawings")
- **All Priority dropdown** — filter by Urgent / High / Medium / Low
- **All Members dropdown** (Managers/Admins) — see tasks for one specific person
- **Sort dropdown** — Newest First, Oldest First, Due Date ↑↓, Title A–Z, Priority ↓

Filters combine — for example, you can show only **High priority Shop Drawings** assigned to a specific member.

On the Kanban board, all tasks are always visible by column; there is no filter bar there.`,
  },

  /* ── Fallback: unrecognised / off-topic ───────────────── */
  {
    id: 'off-topic',
    topic: 'general',
    patterns: ['weather', 'joke', 'news', 'sports', 'recipe', 'music', 'movie', 'code', 'programming', 'python', 'javascript', 'game'],
    response: `I'm Mila — here only to help with **PrecastFlow**! 😊

I'm not able to help with that topic, but I'm great at answering questions about the system.

Try asking me:
- "How do I move a task to the next stage?"
- "What's the difference between Admin and Manager?"
- "How does file version control work?"`,
  },
];

/* ══════════════════════════════════════════════════════════
   MATCHER ENGINE
══════════════════════════════════════════════════════════ */

function score(entry: KnowledgeEntry, input: string): number {
  let s = 0;
  for (const pattern of entry.patterns) {
    if (input.includes(pattern)) {
      // Longer patterns = more specific = higher weight
      s += pattern.split(' ').length * 2;
    }
  }
  return s;
}

export function findAnswer(
  rawInput: string,
  lastTopic: string | null,
): KnowledgeEntry | null {
  const input = rawInput.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();

  let best: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let s = score(entry, input);
    // Small continuity bonus: if we're already discussing this topic
    if (lastTopic && entry.topic === lastTopic && s > 0) s += 1;
    if (s > bestScore) { bestScore = s; best = entry; }
  }

  return bestScore > 0 ? best : null;
}

export const FALLBACK_RESPONSE = `I'm not sure I understood that question. Could you rephrase it?

Here are some things I can help with:
1. How to navigate each page (Dashboard, Tasks, Kanban, Team KPIs, Members, Activity)
2. How to create, edit, assign, or move tasks
3. The 10 workflow stages and how they connect
4. File uploads and version control
5. User roles and what each role can do
6. Notifications, comments, and profile settings

Just ask in plain language and I'll guide you!`;
