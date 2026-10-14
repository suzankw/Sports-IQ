// Fictional people (Decision 5: generic names, no real individuals).

export const FIRST_NAMES = {
  female: ['Amani', 'Zawadi', 'Neema', 'Imani', 'Makena', 'Njeri', 'Wairimu', 'Chebet', 'Muthoni', 'Kerubo', 'Halima', 'Amina', 'Zuri', 'Lulu', 'Faith', 'Grace', 'Mercy', 'Joy', 'Sharon', 'Ivy', 'Tracy', 'Natalie', 'Abigail', 'Ruth', 'Esther', 'Wanjiru', 'Akinyi', 'Achieng', 'Atieno', 'Nyokabi'],
  male: ['Brian', 'Kevin', 'Dennis', 'Victor', 'Allan', 'Ian', 'Collins', 'Felix', 'Samuel', 'Daniel', 'David', 'Joseph', 'Peter', 'James', 'Elijah', 'Caleb', 'Ethan', 'Liam', 'Noah', 'Tevin', 'Ryan', 'Mark', 'Eric', 'Martin', 'Jabari', 'Baraka', 'Juma', 'Hassan', 'Omar', 'Kofi'],
};

export const LAST_NAMES = ['Kamau', 'Mwangi', 'Otieno', 'Kariuki', 'Ochieng', 'Wanjala', 'Njoroge', 'Kimani', 'Mutua', 'Omondi', 'Kiprop', 'Kibet', 'Barasa', 'Wafula', 'Odhiambo', 'Mugo', 'Gitau', 'Onyango', 'Chege', 'Macharia', 'Kirui', 'Rotich', 'Langat', 'Cheruiyot', 'Nyambura', 'Wekesa', 'Simiyu', 'Okoth', 'Owino', 'Ndungu', 'Maina', 'Karanja', 'Koech', 'Tanui', 'Muriuki', 'Achola', 'Adongo', 'Nduta', 'Kosgei', 'Mbugua'];

/** Opponents aren't in the system, so their scorers are free text. */
export const OPPONENT_SCORERS = ['D. Patel', 'M. Mensah', 'A. Okoro', 'T. Shah', 'L. Njoroge', 'S. Kiprono', 'R. Hughes', 'J. Mutiso', 'K. Desai', 'P. Waweru'];

export const COACHES = [
  { key: 'footballHead', name: 'John Smith', title: 'Mr.', photo: null },
  { key: 'footballAssistant', name: 'Daniel Ochieng', title: 'Mr.', photo: null },
  { key: 'basketballHead', name: 'Michael Wekesa', title: 'Mr.', photo: 'coach-basketball-head.jpg' },
  { key: 'basketballAssistant', name: 'Grace Achieng', title: 'Coach', photo: 'coach-basketball-assistant.jpg' },
  { key: 'netballHead', name: 'Esther Nyambura', title: 'Mrs.', photo: 'coach-netball-head.jpg' },
];

export const ADMIN = { name: 'Margaret Wanjiku', title: 'Mrs.' };
export const FORMER_COACH = { name: 'Peter Kimani', title: 'Mr.' };

export const REPORT_QUOTES = [
  'A resolute display of discipline and tactical superiority. The team executed the game plan with Highland spirit.',
  'We controlled the tempo from the first whistle and never let our standards drop.',
  'Character under pressure. The squad stayed composed and found a way when it mattered.',
  'Not our sharpest performance, but the work rate and communication were outstanding.',
  'A hard lesson against a well-drilled side. We will learn from it and come back stronger.',
];

export const SEASON_QUOTE = (sportName) => ({
  text: `Discipline, teamwork, and an unwavering commitment to excellence have defined our ${sportName.toLowerCase()} programme this season. The statistics reflect character as much as skill.`,
  attribution: 'Director of Athletics',
});

export const INDUCTEES = [
  { name: 'Wanjiru Kamau', sport: 'netball', years: '2012–2016', achievement: 'Captained the First VII to three KAISSO titles', citation: 'A goal keeper whose reading of the game turned defence into attack, and whose leadership set the standard for every squad since.' },
  { name: 'Brian Otieno', sport: 'football', years: '2014–2018', achievement: "The school's all-time leading scorer with 64 goals", citation: 'Scored in four consecutive regional finals and went on to play university football in Nairobi.' },
  { name: 'Amina Barasa', sport: 'basketball', years: '2015–2019', achievement: 'First Turi player named KAISSO Most Valuable Player', citation: 'A point guard who averaged a double-double in her final season and now coaches at youth level.' },
  { name: 'Samuel Mugo', sport: 'football', years: '2009–2013', achievement: 'Kept 21 clean sheets in a single season', citation: 'A goalkeeper remembered as much for his calm organisation of the back line as for his saves.' },
  { name: 'Faith Chebet', sport: 'netball', years: '2017–2021', achievement: 'Scored 312 goals at 89% in her final season', citation: 'The most accurate shooter in the history of the First VII.' },
  { name: 'Kevin Ndungu', sport: 'basketball', years: '2011–2015', achievement: 'Led the Boys First V to their first IAPS Cup', citation: 'A relentless defender whose 41 blocks in one season still stand as a school record.' },
];
