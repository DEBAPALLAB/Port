// Personal photographs supplied in this checkout. No stock stand-ins.
export const personalPhotos = {
  portrait: { src: '/my photos/20251230_191320(1).jpg', alt: 'Debapallab smiling outdoors at night', caption: 'Debapallab Das. Usually goes by Dev.' },
  candid: { src: '/my photos/20250311_141543.jpg', alt: 'Dev taking a mirror photograph in a red T-shirt', caption: 'The person on the other side of the screen.' },
  college: { src: '/my photos/20260823_13242790.jpg', alt: 'Dev outside with friends, with lights in the background', caption: 'There’s a life between the builds, too.' },
};
export const rabbitHoles = [
  {
    id: 'simulation', question: 'Would anyone actually want this?', name: 'notaprompt', opening: 'I built a simulator. Then gave my own product 54/100.', paragraphs: [
      'I wanted to see how an idea spreads through a population: who adopts, who resists, and where it stalls. So I built agents inside a small-world social network and watched the decisions cascade.',
      'Then I audited it. The population data and network mechanics were defensible. Agents that never changed their minds? No switching behaviour? No backtests yet? Those were real holes. I posted the score anyway.',
      'Later I ran a Quibi backtest with 140 agents and wrote up the methodology, assumptions, and limits. One company is one data point. I want someone to find the hole in the reasoning.'
    ], link: '/work/notaprompt/', action: 'Read the case study', takeaway: 'Ambition gets it built. Being willing to be wrong makes it better.'
  },
  {
    id: 'inbox', question: 'When did my inbox become a billboard?', name: 'The WhatsApp study', opening: 'One user observation. An inbox redesign. Six PRDs. Nobody asked.', paragraphs: [
      '“First it was email, then SMS. Now it’s WhatsApp.” That stuck with me. Delivery updates, reminders and OTPs were competing with the people we opened the app to talk to.',
      'I made an independent study of business messaging in India, a sortable phone prototype, and a proposal for a Business tab and a separate place for codes. Then I wrote six PRDs with evidence, risks and sources.',
      'Every figure has a source and a trust rating. The calculator labels its assumptions. There’s a list of what I couldn’t verify. I care about the argument holding up as much as the screens looking good.'
    ], link: '/work/whatsapp-inbox/', action: 'Explore the study', takeaway: 'The tiny friction between knowing and doing is usually where I start looking.'
  },
  {
    id: 'companionship', question: 'Can a chatbot love you back?', name: 'FEEL! 2026 · Hyderabad', opening: 'I build AI. I wanted to hear from people who live with its consequences.', paragraphs: [
      'At 20, while working at Mindspace AI R&D LLP, I moderated “The Ethics of AI Companionship” at FEEL! 2026 by GoodMind Care Foundation.',
      'A paediatric critical-care doctor, an autism-screening founder, a mental-health founder and a Telangana Innovation Cell representative brought four very different views. I came with a question for each of them: about children, access to care, men who never talk, and who answers when emotional AI causes harm.',
      'I left with sharper questions than I walked in with. Building the technology makes those conversations feel more necessary.'
    ], takeaway: 'The people affected by a product belong in the conversation about it.'
  },
  {
    id: 'play', question: 'What if I just tried it?', name: 'The experiments in between', opening: 'Sometimes the idea is a camera-controlled chord deck at 1 AM.', paragraphs: [
      'I got early access to Motions, built playful camera-based prototypes, and spent just as much time spotting the friction between a fun demo and something people would return to.',
      'That’s what excites me about new tools: the ideas I stop talking myself out of trying. I’ll happily spend a birthday eve stress-testing one until the quota runs out. Reasonable party behaviour.',
      'The tool can get me to a polished result quickly. I still have to decide whether it’s the right thing to make. That part is taste, and I’m working on it.'
    ], takeaway: 'I want the cost of trying to get smaller, and the things I attempt to get bigger.'
  },
];
export const chapters = [
  { id: 'home', nav: 'Dibrugarh', title: 'First, the Tea City.', paragraphs: ['I’m from Dibrugarh, Assam. I grew up there and stayed through higher secondary. Engineering was always the plan; I just didn’t know how many other interests I’d bring along.'] },
  { id: 'school', nav: 'Design', title: 'Design got there first.', paragraphs: ['In Class 11, I joined the Snapchat Opinion Leader programme through Under 25 Universe. Graphic design and digital content turned into freelance work. Then UI/UX. Then wanting to build the things I was designing.', 'I still care about the type, the copy, the little interaction. Those decisions change whether someone understands what we’ve made.'], note: 'Snapchat Opinion Leader, August 2022–July 2023' },
  { id: 'college', nav: 'Nagpur', title: 'Then came Nagpur.', paragraphs: ['I moved to IIIT Nagpur for Computer Science and Engineering. I kept freelancing, led Avalok, the college media cell, and worked across design, motion and content. I’m also pursuing the online BS in Data Science at IIT Madras.', 'College is also having a DBMS exam in an hour while my head is still inside a half-built simulator. The hard part is returning to all the decisions I was holding in my head. I wrote about that too.'], note: 'B.Tech in Computer Science and Engineering, expected 2028' },
  { id: 'hackathons', nav: 'My people', title: 'Five people. One team.', paragraphs: ['At Manthan4Yuva, we won first rank in Forest and Wildlife. More than 100 teams, less than a week, and a problem about tigers that took us three hours to understand.', 'Piyush took stripe matching. Prathamesh owned risk and mapping. Dhruv built the officer’s interface. Aryan kept the data honest. I worked on product, UX, the pitch, and saying “no, cut it” at 2 AM.', 'Everyone defended their piece hard and dropped it when it stopped working. Meeting the Chief Minister of Maharashtra was the photo. That team is the part I’ll remember.'] },
];
export const competitions = [
  { name: 'Manthan4Yuva', event: 'Forest and Wildlife · Maharashtra · 2026', story: 'Our test was simple: would a tired forest officer open this at 6 AM without calling someone for help? I led product, UX and the pitch while the team worked across stripe matching, risk mapping and the data pipeline.', result: '1st place', detail: '100+ teams. Five teammates willing to kill their own ideas.' },
  { name: 'UX Wizarding', event: 'E-Summit · IIIT Naya Raipur · 2025', story: 'User analysis, personas, wireframes and a complete UX proposal in a few hours. Sumanth, Om, Vedant and I built the presentation around the user’s journey and the reasons behind each decision.', result: '1st place', detail: 'Research, accessibility, and a story the judges could follow.' },
  { name: 'Rebranding Wars: Zepto', event: 'Zepto Brand Hackathon · 2025', story: 'With Arjun, Fahad and Aryan, I worked on a new brand direction for Zepto: values, visual identity and campaign strategy. A chance to think about what a brand promises before deciding what it looks like.', result: '1st place', detail: 'Brand strategy all the way through to the campaign.' },
  { name: 'Campus Innovate', event: 'GH Raisoni University · Solvi', story: 'Three hours late, one injured leg, and about 2.5 hours to submission. Dhruv, Shivam and I built a peer-to-peer doubt-solving network that routes questions to the right people. We focused on time to a useful answer.', result: '1st place', detail: 'Less time meant choosing one thing that mattered.' },
  { name: 'BrandXperience', event: 'TantraFiesta · IIIT Nagpur', story: 'Eight hours to create a luxury perfume brand with Priya and Om. We started with how the brand should feel: dark, minimal, a little intimidating. Then came the design system, visual language and an actual commercial.', result: '2nd place', detail: 'We made the ad too.' },
  { name: 'Rebranding Wars', event: 'E-Summit · IIIT Nagpur', story: 'With Hetansh and Priya, I went from redrawing Kodak’s logo to redesigning Krave Beauty’s UX around a live problem statement. Two rounds, two very different kinds of design judgment.', result: '2nd place', detail: 'A logo in one round. A whole user journey in the next.' },
  { name: 'Cineblitz', event: 'Delhi Technological University', story: 'Aditya, Tanishq, Suraj and I ideated, shot and edited a film under a tight deadline. Filmmaking belongs here alongside software: a story still has to land with the person watching.', result: '3rd place', detail: 'Yes, there’s a filmmaking chapter too.' },
];
