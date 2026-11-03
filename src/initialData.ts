import { Project, Person, Task } from './types';

export const DEFAULT_PEOPLE: Omit<Person, 'houseId' | 'collaborators'>[] = [
  { id: 'kyle', name: 'Kyle', colorClass: 'bg-emerald-500 text-white' },
  { id: 'yazmin', name: 'Yazmin', colorClass: 'bg-rose-500 text-white' },
  { id: 'amaya', name: 'Amaya', colorClass: 'bg-amber-400 text-slate-905' },
];

export const DEFAULT_PROJECTS: Omit<Project, 'houseId' | 'collaborators'>[] = [
  { id: 'outdoor', name: 'Outdoor & Yard', description: 'Decks, fencing, yard care, and landscaping', colorClass: 'emerald' },
  { id: 'sunroom', name: 'Porch & Sunroom', description: 'Screened in porch and sunroom projects', colorClass: 'amber' },
  { id: 'basement', name: 'Basement & Storage', description: 'Indoor cleaning, cellar organizing', colorClass: 'blue' },
  { id: 'uncategorized', name: 'General House List', description: 'Quick dynamic to-dos around the house', colorClass: 'stone' },
];

export const DEFAULT_TASKS: Omit<Task, 'houseId' | 'collaborators'>[] = [
  {
    id: 't1',
    projectId: 'outdoor',
    title: 'Stain outdoor play area wood',
    status: 'pending',
    targetDate: '2026-06-15',
    assigneeId: 'kyle',
    notes: [
      { id: 'n1', content: 'Use semi-transparent pine stain.', createdAt: '2026-06-07T14:59:00Z' }
    ],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'high'
  },
  {
    id: 't2',
    projectId: 'outdoor',
    title: 'Clean out grass and rake dirt by edging along fence',
    status: 'pending',
    targetDate: '',
    assigneeId: 'kyle',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'medium'
  },
  {
    id: 't3',
    projectId: 'outdoor',
    title: 'Order mulch and spread it all around',
    status: 'pending',
    targetDate: '2026-06-12',
    assigneeId: 'kyle',
    notes: [
      { id: 'n2', content: 'Need approximately 4 cubic yards of dark brown mulch.', createdAt: '2026-06-07T15:10:00Z' }
    ],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'high'
  },
  {
    id: 't4',
    projectId: 'outdoor',
    title: 'Dig out edging area by garden beds',
    status: 'pending',
    targetDate: '',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'low'
  },
  {
    id: 't5',
    projectId: 'sunroom',
    title: 'Deep clean screened in porch',
    status: 'pending',
    targetDate: '2026-06-20',
    assigneeId: 'yazmin',
    notes: [
      { id: 'n3', content: 'Vacuum screens, pressure wash floorboards, wipe cushions.', createdAt: '2026-06-07T15:15:00Z' }
    ],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'medium'
  },
  {
    id: 't6',
    projectId: 'outdoor',
    title: 'Put in edging by front garden beds',
    status: 'pending',
    targetDate: '',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'medium'
  },
  {
    id: 't7',
    projectId: 'outdoor',
    title: 'Create pathway in front yard',
    status: 'pending',
    targetDate: '',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'low'
  },
  {
    id: 't8',
    projectId: 'outdoor',
    title: 'Take down apple tree in front yard',
    status: 'pending',
    targetDate: '',
    assigneeId: 'kyle',
    notes: [
      { id: 'n4', content: 'Check if we need a trimmer or chainsaw rental.', createdAt: '2026-06-07T15:20:00Z' }
    ],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'high'
  },
  {
    id: 't9',
    projectId: 'outdoor',
    title: 'Mow back yard',
    status: 'pending',
    targetDate: '2026-06-08',
    assigneeId: 'kyle',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'chore',
    priority: 'medium'
  },
  {
    id: 't10',
    projectId: 'basement',
    title: 'Clean out basement',
    status: 'pending',
    targetDate: '',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'low'
  },
  {
    id: 't11',
    projectId: 'uncategorized',
    title: "Put away Amaya's clothes in hallway",
    status: 'pending',
    targetDate: '2026-06-07',
    assigneeId: 'amaya',
    notes: [],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'chore',
    priority: 'high'
  },
  {
    id: 't12',
    projectId: 'sunroom',
    title: 'Get rid of the beverage cooler in the sunroom',
    status: 'pending',
    targetDate: '',
    assigneeId: 'kyle',
    notes: [
      { id: 'n5', content: 'List on Facebook Marketplace or post for free pickup.', createdAt: '2026-06-07T15:30:00Z' }
    ],
    createdAt: '2026-06-07T14:59:00Z',
    kind: 'project',
    priority: 'low'
  },
];
