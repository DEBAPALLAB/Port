// Product decisions marked on the real Superforms screens. Boxes are percentages of the 1440×960 screenshots.
export const decisionKinds = {
  respondent: { label: 'Protects the respondent', short: 'Respondent' },
  creator: { label: 'Saves the creator effort', short: 'Creator' },
  guardrail: { label: 'Keeps the result safe', short: 'Guardrail' },
};

export const editorScreens = [
  {
    id: 'build',
    label: 'Builder',
    src: '/cases/superforms/builder-build.jpg',
    alt: 'The Superforms builder: question blocks on the left, the live question on a central canvas, and question settings on the right.',
    decisions: [
      { kind: 'creator', box: [42.5, 1, 15, 3.6], title: 'Write, style and test are separate modes.', why: 'Writing questions and styling them are different jobs. Splitting Build, Design and Preview keeps each screen calm, and a style tweak can never hide a content mistake.' },
      { kind: 'respondent', box: [2.8, 22.8, 19.3, 27.7], title: 'Required questions show in the list.', why: 'Every required question adds friction for the person answering. A red dot keeps that cost visible while you write, so making a question required is a choice, not a default.' },
      { kind: 'creator', box: [31.2, 34, 37.5, 29.6], title: 'Edit on the form itself.', why: 'People judge a question by how it reads, not by how it is configured. Editing on the real rendering removes the jump between a settings panel and a preview.' },
      { kind: 'respondent', box: [78.1, 16.1, 19.3, 6.4], title: 'Settings describe their effect.', why: '“Block progress until answered” tells the creator what the respondent will experience. The label explains the consequence, not just the name of the switch.' },
      { kind: 'guardrail', box: [72.6, 1.2, 6.2, 3.4], title: 'AI is a tool, not the editor.', why: 'Generation gets you a draft fast, but trust comes from control. AI lives in the toolbar, and anything it changes stays editable by hand and can be undone in one step.' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    src: '/cases/superforms/builder-design.jpg',
    alt: 'The Superforms design panel: art direction presets and motion styles on the left, the live question in the centre, and design system controls on the right.',
    decisions: [
      { kind: 'creator', box: [2.6, 9.4, 19.3, 38.5], title: 'Start from a direction, not a blank theme.', why: 'Most people writing a form are not designers. A finished art direction gives a coherent look in one click, before anyone touches an individual setting.' },
      { kind: 'respondent', box: [2.6, 56.8, 19.3, 28.2], title: 'Motion is named by feel.', why: 'One question at a time needs a transition that signals progress. Options are described by how they feel, like “Soft dissolve + blur”, not by animation terms.' },
      { kind: 'guardrail', box: [78.1, 19.3, 19.3, 44.3], title: 'Tokens, not a free-for-all.', why: 'Buttons, inputs, elevation and fonts come from a small set designed to combine. Any mix still looks considered, so customising can’t break the form.' },
      { kind: 'guardrail', box: [78.1, 65.1, 19.3, 18.2], title: 'Palettes keep contrast built in.', why: 'Tints set background, accent and text together, and dark ones are marked for dark styles. That rules out unreadable combinations before they happen.' },
      { kind: 'creator', box: [31.2, 34, 37.5, 29.6], title: 'Style the real question.', why: 'Changes apply to the question you are editing, instantly. Style decisions are made against actual content instead of a sample card.' },
    ],
  },
];
