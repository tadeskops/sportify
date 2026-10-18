export const turfBookingGuidelines = [
  "Book the turf one week in advance.",
  "For festivals and long weekends, the booker may ask members on Friday to confirm availability.",
  "The game moderator is the person who booked the turf.",
  "The moderator must recheck the listed player count 24 hours before the game and arrange any necessary booking changes.",
  "If the player count is insufficient, the booker must cancel at least 24 hours before the game.",
  "Check the provider's cancellation deadline; if earlier, cancel by that deadline. Notify the group when the booking is cancelled."
];

// `links` are only the actions enabled on this site: postGame (boolean), bookTurf ("#book-turf", "#venues" or "") and whatsapp (group URL or "").
export function generalRules(features, links = {}) {
  const postGameLinks = [
    ...(links.postGame ? [{ label: "Post a game", href: "#post-game" }] : []),
    ...(links.whatsapp ? [{ label: "Open Sportify group", href: links.whatsapp, external: true }] : [])
  ];
  const bookTurfLinks = [
    ...(links.bookTurf ? [{ label: "Book a turf", href: links.bookTurf }] : []),
    { label: "Turf booking management (G3.3)", href: "#G3.3" }
  ];
  return [
    {
      id: "joining", title: "Joining & guests", caption: "Confirmed players first. A fair waitlist for everyone.",
      blocks: [
        {
          number: "1.1", title: "Main List & Waitlist",
          bullets: [
            "Add only your own name, and only when you can attend.",
            "If unsure or the Main List is full, use the Waitlist.",
            "Move to the Main List only after the coordinator confirms a place.",
            "Be open to an agreed larger venue or fair rotation; extra capacity is not guaranteed."
          ]
        },
        {
          number: "1.2", title: "Guests",
          bullets: [
            "One guest per member, subject to capacity. Additional guests join the Waitlist.",
            "The inviting member pays the guest's share within 24 hours, including if the guest does not show.",
            "Guests follow the same safety and conduct rules."
          ]
        },
        // Shown only when the joining guide is off; numbered last so G1.1/G1.2 links never shift.
        ...(!features.join ? [{
          number: "1.3", title: "How to join",
          bullets: [
            "Join the Sportify WhatsApp group and check the planned games for the following week.",
            "Check the sport, venue, date, time, available places and contribution.",
            "Add your own name to the Main List only when confirmed. Group membership alone does not reserve a place."
          ]
        }] : [])
      ]
    },
    {
      id: "commitment", title: "Cancellations & absence", caption: "Notify the group. Keep the booking cost fair.",
      blocks: [
        {
          number: "2.1", title: "If your plans change",
          bullets: [
            "Cancel at least 24 hours before the game.",
            "Within 24 hours, move your name to the Backout List and notify the coordinator; do not silently delete it.",
            "Pay for a late cancellation unless replaced, including from the Waitlist, or exempt under unavoidable circumstances below."
          ]
        },
        {
          number: "2.2", title: "Unavoidable circumstances",
          bullets: [
            "If unavoidable circumstances, such as an emergency, prevent participation, the player is excluded from the contribution share.",
            "Tell the coordinator as soon as possible so the contribution can be calculated or corrected.",
            "This exemption applies even without a replacement or after contribution details have been shared."
          ]
        },
        {
          number: "2.3", title: "Attendance consequences",
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
          number: "3.1", title: "Our community",
          bullets: [
            "Sportify is self-sustaining and managed by residents. No individual is its owner.",
            "Coordinating a game does not give anyone special playing priority."
          ]
        },
        ...(features.monthlyRotation ? [{
          number: "3.2", title: "Monthly booking responsibility",
          bullets: [
            "Turf and venue-booking duties rotate monthly among different residents.",
            "Announce the next month's coordinators in the group.",
            "Hand over upcoming slots, booking references, payment status and venue contacts.",
            "Booking responsibility is separate from the per-game venue-payment rotation."
          ]
        }] : []),
        {
          number: "3.3", title: "Turf booking management",
          bullets: turfBookingGuidelines
        },
        {
          number: "3.4", title: "For each game",
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
          number: "4.1", title: "Contributions",
          bullets: [
            "Clear dues within 24 hours after the game. Delays may affect eligibility for upcoming games.",
            "A player injured during the game and unable to continue is exempt from that game's contribution."
          ]
        },
        {
          number: "4.2", title: "Venue payment",
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
          number: "5.1", title: "During play",
          bullets: [
            "Avoid reckless challenges, pushes, dangerous contact and unsafe equipment use.",
            "Follow the sport and venue rules; take extra care around players recovering from injury.",
            "No abusive language, aggressive gestures or retaliation.",
            "Encourage teammates after mistakes. Take a break if frustrated."
          ]
        },
        {
          number: "5.2", title: "Concerns & disputes",
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
          number: "6.1",
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
    },
    {
      id: "organise", title: "Organise a game", caption: "Post the list first. Book once the minimum count is reached.",
      blocks: [
        {
          number: "7.1", title: "Prepare and post the game list",
          bullets: links.postGame ? [
            "Open Post a game using the header button or the link below. Game 1 is always there.",
            "Per game, choose the sport, game number, venue (TBD until booked), one date and the probable time. Tick Time is tentative if unsure.",
            "One game has one date and time. For another day or sport, tap + Add game; it copies the previous game on the next day.",
            "Check the minimum count to book and the count stop. Add an optional note, such as the approximate contribution.",
            "Read the preview. For two or more days it adds the day line, e.g. Sat & Sun or Mon, Sat & Sun.",
            "Type in the preview to change anything; Undo my edits rebuilds it from the form.",
            "Tap Share on WhatsApp, choose the Sportify group and send from your own account. Otherwise, Copy message and paste it there.",
            "Post early to book the turf a week ahead."
          ] : [
            "Copy the latest game list from the group, or start with: \"Those who wish to join kindly copy this message, add your name and paste.\"",
            "Per game, give the game number and sport, venue (TBD until booked), one date and probable time, and a blank \"1.\" name list.",
            "End each game with the minimum count to book and the count stop.",
            "For games on several days, ask players to add names with the day, e.g. Sat & Sun.",
            "Post early enough to book the turf one week in advance."
          ],
          links: postGameLinks
        },
        {
          number: "7.2", title: "Book the turf",
          bullets: [
            "Book only after the list reaches the minimum count for that game.",
            ...(links.bookTurf ? ["Open Book a turf, choose the venue and follow its provider steps (date, sport/format, slot)."] : ["Book through the venue's provider, choosing the date, sport/format and slot."]),
            "Check the date, AM/PM and live availability, then pay the advance and confirm the booking date and time.",
            "Update the game in the group: replace the TBD venue, mark it Booked and confirm the final time.",
            "From then on you moderate the game; follow G3.3 for the 24-hour count recheck and cancellations."
          ],
          links: bookTurfLinks
        }
      ]
    }
  ];
}
