# Design Guidelines: Executive Team Management Platform

## Design Approach: Fluent Design System
**Rationale**: Given the Microsoft ecosystem integrations (OneDrive, OneNote, Teams) and enterprise productivity focus, Fluent Design provides familiar patterns for executive users while maintaining professional polish and data density.

**Core Principles**:
- Clarity over decoration - information hierarchy is paramount
- Efficiency-first layouts - minimize clicks to complete actions
- Professional polish - executives expect refined, trustworthy interfaces
- Seamless integration aesthetic - feel native to Microsoft ecosystem

---

## Typography System

**Font Stack**: Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif (native system fonts for performance and familiarity)

**Hierarchy**:
- Page Titles: text-2xl font-semibold (executives scanning multiple views)
- Section Headers: text-lg font-semibold
- Card Titles/Task Names: text-base font-medium
- Body Text: text-sm font-normal
- Metadata/Timestamps: text-xs text-gray-600
- Metrics/Numbers: text-3xl font-bold (dashboard KPIs)

**Implementation Note**: Consistent font-weight usage - semibold for headers, medium for emphasis, normal for content.

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Card margins: space-y-4
- Form fields: space-y-2
- Dashboard grid gaps: gap-4

**Grid Structure**:
- Main dashboard: 12-column grid (grid-cols-12)
- Sidebar navigation: Fixed 256px (w-64), collapsible to icon-only 64px
- Content area: flex-1 with max-w-7xl container
- Card layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for task cards
- Analytics: grid-cols-2 lg:grid-cols-4 for KPI metrics

**Responsive Breakpoints**:
- Mobile: Single column, bottom navigation
- Tablet: 2-column layouts, collapsible sidebar
- Desktop: Full multi-column, persistent sidebar

---

## Component Library

### Navigation
**Primary Sidebar** (Role-based):
- Executive View: Dashboard, Tasks, Analytics, Communications, Documents
- Virtual PA View: Task Management, Bulk Operations, Team Overview, Automation Rules
- Integration icons with labels (OneDrive, HubSpot, Jira, Trello, Teams)
- User profile with role indicator at bottom
- Notification badge on relevant sections

**Top Bar**:
- Global search (cmd+k shortcut indicator)
- Quick action dropdown ("+ New Task", "+ Create Deal", etc.)
- Active filters/view indicator
- Notification center icon with count badge
- User avatar with dropdown menu

### Dashboard Components

**KPI Cards** (Analytics):
- 4-column grid on desktop
- Large number display (text-3xl)
- Trend indicator (↑↓ with percentage)
- Comparison text ("vs. last week")
- Subtle background for each metric category
- Iconography from Heroicons

**Task Lists/Cards**:
- Compact card design with border-l-4 (color-coded by source: Trello blue, HubSpot orange, Jira indigo)
- Title, assignee avatar, due date, priority indicator
- Source integration icon (top-right)
- Quick actions on hover (assign, snooze, complete)
- Drag-handle for reordering (PA view)

**Activity Timeline**:
- Vertical timeline design
- Grouped by day with date headers
- Activity type icons (task created, deal updated, document shared)
- Timestamp and actor information
- Expandable for details

**Document Manager**:
- Table view with file name, type, last modified, owner
- Grid view toggle for visual browsing
- Integration with OneDrive folder structure
- Quick preview pane (right sidebar)
- Link to related tasks/projects

### Forms & Inputs

**Consistent Form Patterns**:
- Labels: text-sm font-medium above inputs
- Input fields: Tailwind form classes with focus rings
- Helper text: text-xs text-gray-500 below inputs
- Error states: border-red-500 with error message
- Required field indicator (*)

**Task Creation Modal**:
- Large modal (max-w-2xl)
- Multi-step if complex (tabs for Basic Info, AI Suggestions, Integrations)
- Claude AI panel suggesting category, priority, assignee
- Integration selector (which tool to create in)
- Attachment uploader

### Data Visualization

**Analytics Charts**:
- Task completion trends (line chart)
- Team workload distribution (stacked bar)
- Priority breakdown (donut chart)
- Source distribution (horizontal bar)
- Use chart.js or recharts library

**Team Overview**:
- Avatar grid with task count badges
- Workload heatmap (visual capacity indicator)
- Current focus/active task display

### Communication Hub

**Teams Integration Panel**:
- Conversation threads styled like chat interface
- Message bubbles with sender avatars
- Inline mentions and task links
- Quick reply input at bottom
- Unread indicator

### Virtual PA Automation Panel

**Bulk Operations Interface**:
- Checkbox selection on task lists
- Floating action bar when items selected
- Batch actions: Assign, Update Status, Move to Board, Set Priority
- Confirmation dialogs with action summary

**Automation Rules Builder**:
- Visual if-then-else cards
- Trigger selection (new task in HubSpot, Jira status change)
- Action configuration (create Trello card, notify team, assign to PA)
- Save as template functionality

---

## Interactive Elements

**Buttons**:
- Primary: Solid fill, font-medium, px-4 py-2
- Secondary: Outline, hover:bg-gray-50
- Tertiary: Text-only with hover:underline
- Icon buttons: p-2 rounded hover:bg-gray-100
- Destructive: Red theme for delete/cancel

**Dropdowns & Selects**:
- Native select styling with custom arrow
- Multi-select with tag display
- Searchable dropdowns for assignees, tags

**Modals & Overlays**:
- Backdrop: bg-black/50
- Modal container: max-w-lg to max-w-4xl depending on content
- Header with title and close button
- Footer with action buttons (right-aligned)
- Slide-over panels for previews/details

**Loading States**:
- Skeleton screens for initial data load
- Spinner for actions in progress
- Optimistic UI updates (immediate feedback)
- Toast notifications for confirmations

---

## Visual Hierarchy & Organization

**Priority Indicators**:
- High: Red accent border/badge
- Medium: Yellow accent
- Low: Gray accent
- Urgent: Pulsing red dot animation

**Status Badges**:
- Rounded-full pills
- Color-coded (green: complete, blue: in progress, gray: todo, red: blocked)
- Consistent sizing (px-2 py-1 text-xs)

**Card Shadows**:
- Default: shadow-sm
- Hover: shadow-md transition
- Active/Selected: ring-2 ring-blue-500

---

## Professional Polish

**Empty States**:
- Centered illustrations (simple line art)
- Helpful messaging
- Primary action button
- "No tasks for today" with celebration tone

**Error Handling**:
- Inline validation messages
- Graceful degradation for integration failures
- Retry mechanisms with clear messaging
- Fallback content when data unavailable

**Accessibility**:
- ARIA labels on all interactive elements
- Keyboard navigation (tab order, shortcuts)
- Focus indicators (ring-2 ring-blue-500)
- Screen reader announcements for dynamic content
- Color contrast ratios meeting WCAG AA

---

## Integration Visual Language

**Service Differentiation**:
Each integrated service uses subtle brand color accents:
- Trello: Blue left border on cards
- HubSpot: Orange icon/badge
- Jira: Indigo accent
- OneDrive: Cyan indicator
- Teams: Purple notification dot
- Claude AI: Amber AI suggestion badge

Maintain neutral base interface with service colors as accents only.

---

**Key Success Metrics**: Interface should enable executives to process 50+ tasks in under 5 minutes, with clear visual scanning patterns and one-click actions for 80% of operations.