import { nanoid } from 'nanoid'

const today = () => new Date().toISOString().split('T')[0]

export function seedDatabase(sqlite: any) {
  // Check if already seeded
  const count = sqlite.prepare('SELECT COUNT(*) as c FROM groups').get()
  if (count.c > 0) return

  const now = today()

  // Seed groups
  const groups = [
    { id: nanoid(), name: 'Product Launch', icon: '🚀', color: '#6C5CE7', sort_order: 0 },
    { id: nanoid(), name: 'Sales Pipeline', icon: '💰', color: '#00B894', sort_order: 1 },
    { id: nanoid(), name: 'Engineering', icon: '⚙️', color: '#E17055', sort_order: 2 },
    { id: nanoid(), name: 'Marketing', icon: '📣', color: '#FDCB6E', sort_order: 3 },
    { id: nanoid(), name: 'Personal', icon: '🏠', color: '#74B9FF', sort_order: 4 },
  ]

  const insertGroup = sqlite.prepare(
    'INSERT INTO groups (id, name, icon, color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  for (const g of groups) {
    insertGroup.run(g.id, g.name, g.icon, g.color, g.sort_order, now, now)
  }

  // Seed tags
  const tags = [
    { id: nanoid(), name: 'Design', color: '#6C5CE7' },
    { id: nanoid(), name: 'Frontend', color: '#00B894' },
    { id: nanoid(), name: 'Backend', color: '#E17055' },
    { id: nanoid(), name: 'Urgent', color: '#FF6B6B' },
    { id: nanoid(), name: 'Research', color: '#FDCB6E' },
    { id: nanoid(), name: 'Bug', color: '#D63031' },
    { id: nanoid(), name: 'Feature', color: '#0984E3' },
    { id: nanoid(), name: 'Meeting', color: '#A29BFE' },
  ]

  const insertTag = sqlite.prepare(
    'INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)'
  )
  for (const t of tags) {
    insertTag.run(t.id, t.name, t.color, now)
  }

  // Seed tasks
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 5)
  const inTwoDays = new Date(); inTwoDays.setDate(inTwoDays.getDate() + 2)
  const d = (date: Date) => date.toISOString().split('T')[0]

  const taskData = [
    { title: 'Finalize landing page copy', desc: 'Review and finalize all the copy for the new landing page.', status: 'in_progress', priority: 'high', due: now, assignee: 'Sarah Chen', group: 0, tags: [0, 1] },
    { title: 'Review Q1 sales metrics', desc: 'Compile and analyze Q1 sales data for the quarterly review.', status: 'todo', priority: 'urgent', due: now, assignee: 'Marcus Rivera', group: 1, tags: [4, 7] },
    { title: 'Fix authentication timeout bug', desc: 'Users are being logged out after 5 minutes instead of 30.', status: 'in_progress', priority: 'urgent', due: d(tomorrow), assignee: 'Alex Kim', group: 2, tags: [2, 5] },
    { title: 'Design email campaign template', desc: 'Create a reusable email template for the spring campaign.', status: 'todo', priority: 'medium', due: d(inTwoDays), assignee: 'Jordan Lee', group: 3, tags: [0, 6] },
    { title: 'Prepare investor deck updates', desc: 'Update the investor presentation with latest metrics.', status: 'todo', priority: 'high', due: d(nextWeek), assignee: 'Sarah Chen', group: 0, tags: [0, 7] },
    { title: 'Set up CI/CD pipeline for mobile app', desc: 'Configure GitHub Actions for automated testing and deployment.', status: 'todo', priority: 'medium', due: d(nextWeek), assignee: 'Alex Kim', group: 2, tags: [2, 6] },
    { title: 'Client onboarding call with Acme Corp', desc: 'Initial onboarding call to set up their account.', status: 'todo', priority: 'high', due: d(tomorrow), assignee: 'Marcus Rivera', group: 1, tags: [7] },
    { title: 'Write API documentation for v2 endpoints', desc: 'Document all new v2 API endpoints with examples.', status: 'in_progress', priority: 'medium', due: d(nextWeek), assignee: 'Alex Kim', group: 2, tags: [2, 6] },
    { title: 'Social media content calendar — April', desc: 'Plan all social media posts for April.', status: 'todo', priority: 'medium', due: d(nextWeek), assignee: 'Jordan Lee', group: 3, tags: [0, 6] },
    { title: 'Groceries for the week', desc: '', status: 'todo', priority: 'low', due: d(tomorrow), assignee: '', group: 4, tags: [] },
    { title: 'Plan team offsite agenda', desc: 'Organize the agenda for the upcoming team offsite.', status: 'todo', priority: 'low', due: null, assignee: 'Sarah Chen', group: null, tags: [7] },
  ]

  const insertTask = sqlite.prepare(
    'INSERT INTO tasks (id, title, description, status, priority, due_date, assignee, group_id, parent_id, sort_order, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insertTaskTag = sqlite.prepare(
    'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)'
  )

  const taskIds: string[] = []
  for (let i = 0; i < taskData.length; i++) {
    const t = taskData[i]
    const id = nanoid()
    taskIds.push(id)
    insertTask.run(id, t.title, t.desc, t.status, t.priority, t.due, t.assignee, t.group !== null ? groups[t.group].id : null, null, i, null, now, now)
    for (const tagIdx of t.tags) {
      insertTaskTag.run(id, tags[tagIdx].id)
    }
  }

  // Add subtasks to "Finalize landing page copy"
  const sub1 = nanoid()
  const sub2 = nanoid()
  insertTask.run(sub1, 'Write hero section copy', '', 'done', 'high', null, 'Sarah Chen', groups[0].id, taskIds[0], 0, now, now, now)
  insertTask.run(sub2, 'Draft feature descriptions', '', 'todo', 'medium', d(tomorrow), 'Sarah Chen', groups[0].id, taskIds[0], 1, null, now, now)

  // Add subtasks to "Prepare investor deck updates"
  const sub3 = nanoid()
  const sub4 = nanoid()
  const sub5 = nanoid()
  insertTask.run(sub3, 'Update financial projections', '', 'todo', 'high', d(inTwoDays), 'Sarah Chen', groups[0].id, taskIds[4], 0, null, now, now)
  insertTask.run(sub4, 'Add new customer logos', '', 'todo', 'low', null, 'Jordan Lee', groups[0].id, taskIds[4], 1, null, now, now)
  insertTask.run(sub5, 'Review competitive landscape slide', '', 'done', 'medium', null, 'Marcus Rivera', groups[0].id, taskIds[4], 2, now, now, now)
}
