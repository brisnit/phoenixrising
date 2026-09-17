/* ===========================================================================
 * ASK PHOENIX — INTERFACE COPY
 * ---------------------------------------------------------------------------
 * Everything the panel says, including what it says when it cannot answer.
 *
 * The unavailable state is not an afterthought here. No provider is connected,
 * so it is currently the ONLY state a visitor could reach — and the deterministic
 * routes it offers (read the process, start a project, write to a person) are
 * genuinely more useful than an apology. If the model is down, those are still
 * the right next steps.
 * ======================================================================== */

export const askPhoenixCopy = {
  title: 'Ask Phoenix',
  /* Set deliberately low. This is a place to ask questions, not an oracle. */
  subtitle: 'Questions about Phoenix Rising, product development or manufacturing.',
  placeholder: 'Ask a question…',
  send: 'Send',
  newConversation: 'New conversation',
  close: 'Close',

  /* §15 — plain, and true. */
  persistence:
    'This conversation stays in your browser session. Closing the tab ends it.',

  /* §16 — shown in the workspace before any project text is sent. */
  projectConsent: {
    label: 'Project-aware answers',
    body: 'To answer questions about your own project, Ask Phoenix needs to send what you have written in this workspace to the AI service that generates the answer. Nothing is sent until you turn this on, and your brief stays in your browser either way.',
    enable: 'Use my project notes',
    enabled: 'Using your project notes',
    disable: 'Stop using them',
  },

  /* §21 — real failure states with useful routes out. */
  unavailable: {
    title: 'Ask Phoenix is not connected yet.',
    body: 'The assistant has not been connected to a model. Everything else on the site works normally, and these are the fastest ways to get the same answers.',
    routes: [
      { label: 'How we develop products', href: '/how-we-develop' },
      { label: 'What happens after you start', href: '/onboarding' },
      { label: 'Start a project', href: '/start' },
      { label: 'Contact Phoenix Rising', href: '/contact' },
    ],
  },
  error: {
    title: 'Ask Phoenix is temporarily unavailable.',
    body: 'Something went wrong reaching the assistant. Your workspace and anything you have written are unaffected.',
    retry: 'Try again',
  },

  /* §22 — grounding, shown as provenance rather than citations. */
  sourcesLabel: 'From Phoenix Rising',
  boundaryLabel: {
    phoenix: 'Based on what Phoenix Rising has published',
    general: 'General product-development information, not a description of Phoenix Rising’s services',
    mixed: 'Partly from Phoenix Rising, partly general product-development information',
    unknown: 'Phoenix Rising has not published this',
  },

  suggestion: {
    label: 'Suggested update',
    target: 'Would go into',
    accept: 'Accept',
    edit: 'Edit',
    dismiss: 'Dismiss',
    accepted: 'Added to your brief',
    /* The whole point, said out loud. */
    note: 'Nothing is added to your brief unless you accept it.',
  },
} as const

/**
 * Page-aware conversation starters.
 *
 * Restrained on purpose — three per route. A wall of suggested prompts is a
 * way of avoiding the blank composer, not a way of helping someone ask what
 * they actually came to ask.
 */
export const starters: Record<string, readonly string[]> = {
  '/': [
    'What does Phoenix Rising do?',
    'Can I start with just an idea?',
    'How does Phoenix approach manufacturing?',
  ],
  '/how-we-develop': [
    'What is production readiness?',
    'Why isn’t a prototype automatically ready for production?',
    'What happens between a design and a finished product?',
  ],
  '/capabilities': [
    'What can Phoenix Rising help move forward?',
    'What does "develop" cover?',
    'What is a prototype actually for?',
  ],
  '/onboarding': [
    'What is a fit review?',
    'What happens before work begins?',
    'How is an engagement defined?',
  ],
  '/about': [
    'Why California and Guangzhou?',
    'What does "information moves both ways" mean?',
    'Where is Phoenix Rising based?',
  ],
  '/projects': [
    'Why are there no case studies?',
    'What counts as project evidence?',
    'What would Phoenix Rising need to publish a project?',
  ],
  '/start': [
    'Which stage does my project fit?',
    'What happens after I start?',
    'What is a fit review?',
  ],
  '/ideate': [
    'What am I still missing?',
    'Help me think through who this is for.',
    'What questions should I answer next?',
  ],
  '/contact': ['What does Phoenix Rising do?', 'What happens after I get in touch?'],
}

export const startersFor = (route: string): readonly string[] =>
  starters[route] ?? starters['/']
