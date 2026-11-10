// Data for the WhatsApp inbox study. Messages are fictional and illustrative; senders are invented names, never real brands.
// Every figure used in the infographics carries its source in the page copy.

// One colour code across every picture on the page: the same four kinds of message, always the same colour.
export const CATS = {
  people: { label: 'People', color: '#30312e', deep: '#30312e', tint: '#ebe8e1', route: 'Chats', blurb: 'Friends, family, classmates' },
  marketing: { label: 'Marketing', color: '#ed5939', deep: '#b93c24', tint: '#ffeee8', route: 'Business, Offers', blurb: 'Sales, reminders, pre-approved offers' },
  utility: { label: 'Utility', color: '#4d6a88', deep: '#3f5b79', tint: '#e3ebf3', route: 'Business, Updates', blurb: 'Delivery, tickets, receipts' },
  auth: { label: 'Authentication', color: '#2f7a5b', deep: '#256349', tint: '#e1f0e9', route: 'Verification', blurb: 'One-time login codes' },
};
export const CAT_ORDER = ['people', 'marketing', 'utility', 'auth'];

// Newest first. Sixteen conversations: five are people.
export const MESSAGES = [
  { id: 'm1', cat: 'utility', name: 'QuickBite', text: 'Out for delivery. Arriving in 12 min', time: '9:58', urgent: true },
  { id: 'm2', cat: 'marketing', name: 'Urban Threads', text: 'Last 3 hours: flat 40% off your cart', time: '9:55' },
  { id: 'm3', cat: 'people', name: 'Amma', text: 'Did you eat? Call me when you are free', time: '9:52', unread: 1 },
  { id: 'm4', cat: 'auth', name: 'FinPay', text: '482913 is your code. Do not share it', time: '9:50', code: '482 913', ttl: 522 },
  { id: 'm5', cat: 'marketing', name: 'NestMart', text: 'You left 2 items in your cart', time: '9:44' },
  { id: 'm6', cat: 'people', name: 'Hostel 4B', text: 'Rhea: who has the lab file?', time: '9:41', unread: 3, group: true },
  { id: 'm7', cat: 'marketing', name: 'TripNow', text: 'Weekend flights from Rs 2,499. Book now', time: '9:37' },
  { id: 'm8', cat: 'utility', name: 'RailJet', text: 'PNR confirmed. Coach B3, seat 41', time: '9:30' },
  { id: 'm9', cat: 'marketing', name: 'LoanQuick', text: 'Pre-approved Rs 50,000. Tap to claim', time: '9:22' },
  { id: 'm10', cat: 'people', name: 'Rhea', text: 'send me the notes pls', time: '9:15' },
  { id: 'm11', cat: 'auth', name: 'CampusPortal', text: '117604 is your login code', time: '9:02', code: '117 604', ttl: 205 },
  { id: 'm12', cat: 'marketing', name: 'StayBox', text: 'Rs 300 off your first stay', time: '8:48' },
  { id: 'm13', cat: 'utility', name: 'CampusPrint', text: 'Your hall ticket is ready to download', time: '8:30' },
  { id: 'm14', cat: 'people', name: 'Prof Sen', text: 'Submit the draft by Friday.', time: '8:10' },
  { id: 'm15', cat: 'utility', name: 'College Office', text: 'Fee receipt for semester 5', time: 'Yesterday' },
  { id: 'm16', cat: 'people', name: 'Dad', text: 'Reached home. All fine.', time: 'Yesterday' },
];

// What each simulated arrival does in the sorted inbox versus the inbox as it is.
export const ARRIVALS = [
  { id: 'friend', label: 'A friend messages', cat: 'people', name: 'Rhea', text: 'are you coming to the library?', asIs: 'Plays a sound', sorted: 'Plays a sound' },
  { id: 'delivery', label: 'A delivery update', cat: 'utility', name: 'QuickBite', text: 'Your rider is at the gate', asIs: 'Plays a sound', sorted: 'Plays a sound. Opens in Business' },
  { id: 'offer', label: 'A sale offer', cat: 'marketing', name: 'Urban Threads', text: 'Ends tonight: 50% off everything', asIs: 'Plays a sound', sorted: 'Silent. Waits in Offers' },
  { id: 'code', label: 'A login code', cat: 'auth', name: 'FinPay', text: '905266 is your code. Do not share it', code: '905 266', ttl: 540, asIs: 'Plays a sound. Sits in the chat list', sorted: 'Instant. Appears in Verification' },
];

export const count = (list, cat) => list.filter(item => item.cat === cat).length;
