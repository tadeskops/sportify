// Supplied football rules, with the community-approved emergency contribution exemption.
export const footballRules = [
  {
    id: "participation", title: "1. Participation Guidelines", caption: "Enrolling, cancellations and attendance",
    blocks: [
      { title: "1.1 Enrolling for the game" },
      { title: "1.1.1 Main List", bullets: ["Add your name only when confirmed to play", "Players may only add their own names"] },
      { title: "1.1.2 Guest Players", bullets: ["One guest per player is permitted", "Inviting player is responsible for guest payment within 24 hours", "If a guest does not show, the inviting player pays their share", "Multiple guests must join the Waitlist"] },
      { title: "1.1.3 Game Participation inclusivity", bullets: ["Add your name only if you’re open to accommodating Waitlisted players (e.g., shifting to a bigger turf)"] },
      { title: "1.2 Cancellation Policy", bullets: ["Remove your name at least 24 hours before the match", "Cancellations after the deadline require payment when no replacement is found or confirmed from the Waitlist, except for unavoidable circumstances such as an emergency."] },
      { title: "1.3 Waitlist", bullets: ["For players who are uncertain about attendance to be wait listed", "Activated when the Main List is full", "Players moved to Main List only when spots become available"] },
      { title: "1.4 Attendance Accountability" },
      { title: "1.4.1 Attendance Etiquette:", bullets: ["If unsure, move your name to the Waitlist or remove it in advance so that others can fill the spot.", "If backing out within 24 hours, move your name to the Backout List instead of removing it"] },
      { title: "1.4.2 First Absence:", paragraphs: ["Player moved to Waitlist for next match"] },
      { title: "1.4.3 Second Absence:", paragraphs: ["Player ineligible for next match"] },
      { title: "1.4.4 Communicated Absence:", paragraphs: ["Payment required, no penalties applied, except for the unavoidable-circumstances exemption below."], quote: "If unavoidable circumstances, such as an emergency, prevent participation, the player is excluded from the contribution share. Inform the moderator as soon as possible so the contribution can be calculated or corrected. This exemption applies even without a replacement or after contribution details have been shared." },
      { title: "1.5 Match Coordination", bullets: ["The moderator is the person who booked the turf", "Direct all availability concerns to the moderator in the group chat for that game"] }
    ]
  },
  {
    id: "payments", title: "2. Payment & Contribution Guidelines", caption: "Transparency & Fairness",
    blocks: [
      { quote: "Transparency & Fairness\nClear payment practices ensure trust and smooth coordination for every game." },
      { title: "2.1 Game Contribution Rules" },
      { title: "2.1.1 Injury Exemption:", paragraphs: ["A player injured during the game and unable to continue is exempted from game contribution for that match."] },
      { title: "2.1.2 Payment Timeline", bullets: ["All dues must be cleared within 24 hours of game completion", "Delays may affect eligibility for upcoming matches"] },
      { title: "2.2 Turf Payment Management", bullets: ["2.2.1 Rotation Basis: Turf payments operate on a rotation basis among regular players", "2.2.2 Moderator Authority: The game moderator may request any playing member of that game to make the turf payment", "2.2.3 Payment Disclosure: Payment details (amount and payer name) must be shared in the group within 2–3 hours after the game"] }
    ]
  },
  {
    id: "safety", title: "3. Safety and Conduct Standards", caption: "Priority: Player Safety",
    blocks: [
      { quote: "Priority: Player Safety\nWe value competitive play, but never at the expense of player wellbeing." },
      { title: "3.1 Prohibited Actions" },
      { title: "3.1.1 Physical Contact", bullets: ["Avoid high feet tackles", "Body checks or pushes", "Clumsy tackle (unintentional but poorly timed tackle)", "Contact with opponent's legs, shins, or ankles"] },
      { title: "3.1.2 Behavior", bullets: ["Aggressive body language or gestures", "Abusive language toward any player", "Retaliatory actions", "Cannot say NO to goal keeping if asked upon or required. (Shall be executed rotation bases)"] },
      { title: "3.2 Expected Conduct" },
      { title: "3.2.1 Self-Control", bullets: ["Manage emotions during play", "Take a moment to compose yourself if frustrated", "Report concerns to your team captain rather than confronting players directly"] },
      { title: "3.2.2 Positive Communication", bullets: ["Encourage teammates after mistakes", "Avoid negative reactions to missed passes", "Motivate rather than criticize"] },
      { title: "3.2.3 Injury Awareness", bullets: ["Many players may be recovering from previous injuries", "Exercise caution in all physical challenges", "Safety takes precedence over winning"] },
      { title: "3.3 Conflict Resolution", paragraphs: ["If you experience an unsafe challenge, inform your team captain. Do not engage the player directly.", "Warnings are meant constructively to protect all players."] }
    ]
  },
  {
    id: "substitution", title: "4. Substitution System", caption: "Captain-managed, fair rotations",
    blocks: [
      { title: "4.1 Rotation Method", bullets: ["Substitutions occur every 5 minutes in a cyclic rotation", "Team captains manage the rotation sequence", "Players receive a sequence number (1–6) upon first substitution", "All players rotate in numerical order", "Unlimited substitutions per match", "Players may re-substituted only after all 6 complete one full rotation"] },
      { number: "4.1.7", title: "Alternative Option:", paragraphs: ["Players preferring a single substitution should inform the captain before kickoff and will play one 15-minute shift"] },
      { title: "4.2 Requesting Substitution", paragraphs: ["Step 1: Raise your hand or wave to the captain", "Step 2: Exit the field immediately when acknowledged", "Step 3: If you feel the substitution timing was unfair, speak with your team captain after exiting"] },
      { title: "4.3 Late Arrivals", paragraphs: ["Players arriving after kickoff begin on the sideline and enter via the rotation system"] },
      { title: "4.4 On-Field Conduct", bullets: ["Resolve all disputes off the field", "Injury substitutions permitted at any time"] }
    ]
  },
  {
    id: "equipment", title: "5. Bibs & Equipment Management", caption: "Hygiene & Responsibility",
    blocks: [
      { quote: "Hygiene & Responsibility\nProper equipment care helps protect player health and ensures long-term usability." },
      { title: "5.1 Hygiene Standard", bullets: ["Bibs must be washed at least once per week, regardless of the number of games played.", "If bibs are reused before washing, they must be properly air-dried."] },
      { title: "5.2 Washing Allocation System", bullets: ["A Bibs Washing List will be maintained for all group regular players.", "Washing responsibility will be assigned such that:", "All members get equal opportunity", "The same member is not repeatedly assigned, unless all others have completed their turn"] },
      { title: "5.3 Incentive for Washing", bullets: ["The player who gets the bibs washed will be exempted from the game contribution for the subsequent match.", "For that match, the contribution will be equally divided among the remaining players (Total Players – 1)."] },
      { title: "5.4 Custody & Handover", bullets: ["Bibs and the football must be handed over to a player who is likely to be available for the next game.", "The handover should be mutually discussed and agreed upon to ensure smooth continuity."] },
      { title: "5.5 Accountability", bullets: ["Failure to follow hygiene or fair allocation may result in:", "Reassignment of responsibility", "Other appropriate action in the interest of fairness and hygiene"], quote: "Shared Responsibility\nThis approach ensures fair distribution of responsibility, improved hygiene, and smooth coordination." }
    ]
  }
];

export const footballSource = {
  title: "JD Soccer Rule Book",
  url: "https://app.notion.com/p/JD-Soccer-Rule-Book-54b9e4d8830240f593a4d6fa22c56342",
  welcome: "Welcome to JD Soccer",
  introduction: "This rule book ensures fair play, safety, and an enjoyable experience for all players.",
  commitment: "5-minute rotations managed by both team captains ensure everyone plays, stays fresh, and reduces injury risk.",
  closing: "Let’s keep JD Soccer safe, fair, hygienic, and enjoyable — on and off the field.",
  signature: "~Team JD Soccer",
  updated: "18 April, 2026"
};
