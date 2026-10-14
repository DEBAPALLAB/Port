// The information architecture of gdcdibrugarh.in, grouped by who comes for what.
// Routes are real routes in the repo. "Wings" are my lens on the menu, which the site itself organises by function.
export const WINGS = [
  { id: 'home', label: 'Home', sub: 'the front door', pages: [] },
  { id: 'patients', label: 'Patients', pages: [
    { id: 'opd', title: 'OPD timings', path: '/hospital' },
    { id: 'registration', title: 'Registration form', path: '/hospital?tab=registration' },
    { id: 'clinics', title: 'Specialty clinics', path: '/hospital?tab=clinics' },
    { id: 'fees', title: 'Hospital fees list', path: '/hospital?tab=charges' },
  ] },
  { id: 'applicants', label: 'Applicants', pages: [
    { id: 'admissions', title: 'BDS and MDS admissions', path: '/admissions' },
    { id: 'bds', title: 'BDS course outline', path: '/academics/bds' },
    { id: 'mds', title: 'MDS programme', path: '/academics/mds' },
    { id: 'forms', title: 'Prospectus and forms', path: '/downloads' },
  ] },
  { id: 'students', label: 'Students', pages: [
    { id: 'antiragging', title: 'Anti-ragging help', path: '/student-portal/anti-ragging' },
    { id: 'circulars', title: 'Circulars and schedules', path: '/downloads' },
    { id: 'board', title: 'Notice board', path: '/' },
    { id: 'alumni', title: 'Alumni registration', path: '/alumni' },
  ] },
  { id: 'faculty', label: 'Faculty', pages: [
    { id: 'directory', title: 'Faculty directory', path: '/faculty' },
    { id: 'dept', title: 'Department pages', path: '/departments/[deptId]' },
    { id: 'research', title: 'Research', path: '/research' },
  ] },
  { id: 'public', label: 'Public', pages: [
    { id: 'tenders', title: 'Tenders', path: '/tenders' },
    { id: 'news', title: 'News and events', path: '/news-events' },
    { id: 'rti', title: 'Disclosures and RTI', path: '/about-us/rti' },
    { id: 'contact', title: 'Contact us', path: '/contact-us' },
  ] },
];

// Six real tasks. `steps` are the real taps from the home page; the last is what the visitor lands on.
export const TASKS = [
  { id: 'opd', ask: 'When is the OPD open?', wing: 'patients', page: 'opd', steps: ['Home', 'Hospital Services', 'OPD Schedule & Timings'], shot: '/cases/gdc/page-hospital.jpg', address: 'gdcdibrugarh.in/hospital',
    note: 'The live page says 9:00 AM to 3:10 PM, Monday to Saturday. The starter text in my repo said 8:00 AM to 2:00 PM, so the people running the site have changed it since. The home hero also has a View OPD timings button, which makes it one tap.' },
  { id: 'seats', ask: 'How many BDS seats are there?', wing: 'applicants', page: 'admissions', steps: ['Home', 'Admissions', 'Seat table'], shot: '/cases/gdc/page-admissions.jpg', address: 'gdcdibrugarh.in/admissions',
    note: 'Sixty-three seats: 54 through the Assam state quota and 9 through the all-India quota. The counter on the home page shows the same 63. My seed file ships 50, so this number was edited after I wrote it.' },
  { id: 'tender', ask: 'Is a tender open right now?', wing: 'public', page: 'tenders', steps: ['Home', 'Tenders Center', 'Live bids'], shot: '/cases/gdc/page-tenders.jpg', address: 'gdcdibrugarh.in/tenders',
    note: 'Today the live list is empty and says so. A tender leaves the list on its last date because the page compares dates on every request. Nobody has to archive it.' },
  { id: 'dept', ask: 'Find the Periodontology department', wing: 'faculty', page: 'dept', steps: ['Home', 'Departments', 'Periodontology and Oral Implantology'], shot: '/cases/gdc/page-dept.jpg', address: 'gdcdibrugarh.in/departments/perio',
    note: 'Nine departments, one route file. This page and the other eight are the same template filled from the departments table.' },
  { id: 'staff', ask: 'Find a lecturer by department', wing: 'faculty', page: 'directory', steps: ['Home', 'Faculty Directory', 'Department filter'], shot: '/cases/gdc/page-faculty.jpg', address: 'gdcdibrugarh.in/faculty',
    note: 'Fifty-nine staff are listed. Search by name, filter by department, switch between teaching and office staff. I cropped the photos out of this capture.' },
  { id: 'ragging', ask: 'Where do I report ragging?', wing: 'students', page: 'antiragging', steps: ['Home', 'Anti-Ragging Help'], shot: '/cases/gdc/page-antiragging.jpg', address: 'gdcdibrugarh.in/student-portal/anti-ragging',
    note: 'One tap. It is one of the six tiles under the hero on purpose: this is the page a student in trouble should not have to hunt for. I cropped the committee phone numbers out of this capture.' },
];
