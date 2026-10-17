export const turfBookingGuidelines = [
  "Book the turf one week in advance.",
  "For festivals and long weekends, the booker may ask members on Friday to confirm availability.",
  "The game moderator is the person who booked the turf.",
  "The moderator must recheck the listed player count 24 hours before the game and arrange any necessary booking changes.",
  "If the player count is insufficient, the booker must cancel at least 24 hours before the game.",
  "Check the provider's cancellation deadline; if earlier, cancel by that deadline. Notify the group when the booking is cancelled."
];

export function generalRules(features) {
  return [
    {
      id: "joining", title: "Joining & guests", caption: "Confirmed players first. A fair waitlist for everyone.",
      blocks: [
        ...(!features.join ? [{
          title: "How to join",
          bullets: [
            "Join the Sportify WhatsApp group and check the planned games for the following week.",
            "Check the sport, venue, date, time, available places and contribution.",
            "Add your own name to the Main List only when confirmed. Group membership alone does not reserve a place."
          ]
        }] : []),
        {
          title: "Main List & Waitlist",
          bullets: [
            "Add only your own name, and only when you can attend.",
            "If unsure or the Main List is full, use the Waitlist.",
            "Move to the Main List only after the coordinator confirms a place.",
            "Be open to an agreed larger venue or fair rotation; extra capacity is not guaranteed."
          ]
        },
        {
          title: "Guests",
          bullets: [
            "One guest per member, subject to capacity. Additional guests join the Waitlist.",
            "The inviting member pays the guest's share within 24 hours, including if the guest does not show.",
            "Guests follow the same safety and conduct rules."
          ]
        }
      ]
    },
    {
      id: "commitment", title: "Cancellations & absence", caption: "Notify the group. Keep the booking cost fair.",
      blocks: [
        {
          title: "If your plans change",
          bullets: [
            "Cancel at least 24 hours before the game.",
            "Within 24 hours, move your name to the Backout List and notify the coordinator; do not silently delete it.",
            "Pay for a late cancellation unless replaced, including from the Waitlist, or exempt under unavoidable circumstances below."
          ]
        },
        {
          title: "Unavoidable circumstances",
          bullets: [
            "If unavoidable circumstances, such as an emergency, prevent participation, the player is excluded from the contribution share.",
            "Tell the coordinator as soon as possible so the contribution can be calculated or corrected.",
            "This exemption applies even without a replacement or after contribution details have been shared."
          ]
        },
        {
          title: "Attendance consequences",
          bullets: [
            "First uncommunicated absence: Waitlist for the next game.",
            "Second absence: ineligible for the next game.",
            "Communicated absence: no attendance penalty; the payment rule above still applies."
          ]
        }
      ]
    },
    {
      id: "coordination", title: "Resident coordination", caption: "Shared responsibility, not individual ownership.",
      blocks: [
        {
          title: "Our community",
          bullets: [
            "Sportify is self-sustaining and managed by residents. No individual is its owner.",
            "Coordinating a game does not give anyone special playing priority."
          ]
        },
        ...(features.monthlyRotation ? [{
          title: "Monthly booking responsibility",
          bullets: [
            "Turf and venue-booking duties rotate monthly among different residents.",
            "Announce the next month's coordinators in the group.",
            "Hand over upcoming slots, booking references, payment status and venue contacts.",
            "Booking responsibility is separate from the per-game venue-payment rotation."
          ]
        }] : []),
        {
          title: "Turf booking management",
          bullets: turfBookingGuidelines
        },
        {
          title: "For each game",
          bullets: [
            "The game moderator shares session details and booking changes in the game group.",
            "Raise availability concerns there. Arrive on time and notify the coordinator if delayed.",
            "If the venue cancels or play is unsafe, follow the coordinator's update and the venue's refund or rescheduling terms."
          ]
        }
      ]
    },
    {
      id: "payments", title: "Payments", caption: "Pay promptly. Share costs transparently.",
      blocks: [
        {
          title: "Contributions",
          bullets: [
            "Clear dues within 24 hours after the game. Delays may affect eligibility for upcoming games.",
            "A player injured during the game and unable to continue is exempt from that game's contribution."
          ]
        },
        {
          title: "Venue payment",
          bullets: [
            "Rotate venue payments among regular players. The coordinator may ask any playing member to pay.",
            "Share the amount and payer's name in the group within 2-3 hours after the game."
          ]
        }
      ]
    },
    {
      id: "safety", title: "Safety & conduct", caption: "Wellbeing comes before winning.",
      blocks: [
        {
          title: "During play",
          bullets: [
            "Avoid reckless challenges, pushes, dangerous contact and unsafe equipment use.",
            "Follow the sport and venue rules; take extra care around players recovering from injury.",
            "No abusive language, aggressive gestures or retaliation.",
            "Encourage teammates after mistakes. Take a break if frustrated."
          ]
        },
        {
          title: "Concerns & disputes",
          bullets: [
            "Report unsafe play to the captain or coordinator instead of confronting another player.",
            "Resolve disputes away from play. Warnings are intended to protect everyone."
          ]
        }
      ]
    },
    {
      id: "rotation", title: "Playing time & substitutions", caption: "Everyone gets a fair turn.",
      blocks: [
        {
          bullets: [
            "Agree a fair, sport-appropriate rotation before play; captains or the coordinator manage it.",
            "Share necessary playing roles through rotation.",
            "Signal for a substitution and exit once acknowledged. Discuss timing concerns after leaving play.",
            "Late arrivals enter through the rotation rather than displacing others.",
            "Injury substitutions are allowed at any time.",
            "For football timings, team sequence and alternatives, use the Football rule book."
          ]
        }
      ]
    }
  ];
}
