export default {
  community: {
    name: "Sportify",
    address: "The Address",
    location: "Aundh-Baner Link Road",
    updated: "24 October 2026"
  },
  branding: {
    logo: "animated"
  },
  links: {
    whatsapp: "https://chat.whatsapp.com/JLOrS75EOh9KTsF0OOIRYF",
    instagram: "https://www.instagram.com/theaddress_society"
  },
  features: {
    join: true,
    monthlyRotation: true,
    venueBooking: true,
    bookingPicker: true,
    gamePost: true,
    football: true,
    search: true,
    sectionNavigation: true,
    backToTop: true,
    photoBooth: true,
    stickers: true,
    appearance: true,
    themePicker: true,
    fontPicker: false,
    textSize: true,
    rememberPreferences: true,
    socialLinks: true,
    whatsapp: true,
    instagram: true
  },
  venues: [
    {
      id: "four-lions",
      enabled: true,
      name: "4 Lions Academy - Pimple Nilakh",
      shortName: "4 Lions",
      provider: "PlaySpots",
      sport: "Football / turf",
      sports: ["cricket", "football"],
      url: "https://book.playspots.in/venues/4-lions-academy-pimple",
      note: "A venue option shared by the community. Confirm the exact location, suitable format and travel time on the provider's listing before booking.",
      bookingSteps: [
        "Select the correct turf venue, for example 4 Lions Academy - Pimple Nilakh.",
        "Select the date using the calendar icon.",
        "Select Cricket, then Cricket 6A.",
        "Select an available slot. The currently shared slot is 8-9:30; verify the date, AM/PM and live availability on PlaySpots.",
        "Pay the required advance through the provider and confirm the booking date and time."
      ],
      contact: {
        name: "",
        phone: ""
      }
    },
    {
      id: "sportygen-aundh",
      enabled: true,
      name: "Sportygen Badminton Arena - Aundh",
      shortName: "Sportygen Aundh",
      provider: "Sportygen",
      sport: "Badminton / court",
      sports: ["badminton"],
      url: "https://book.sportygen.in/venue/sportygen-badminton-arena-aundh",
      note: "A badminton court option shared by the community. Confirm court availability, slot duration and price on Sportygen before booking.",
      bookingSteps: [
        "Open Sportygen (book.sportygen.in) and select Sportygen Badminton Arena - Aundh.",
        "Select Badminton and the date.",
        "Select an available court and slot; verify the date, AM/PM and live availability.",
        "Pay through Sportygen and confirm the booking date, time and court."
      ],
      contact: {
        name: "",
        phone: ""
      }
    },
    {
      id: "sportygen-sanewadi",
      enabled: true,
      name: "Sportygen Sports Club - Sanewadi",
      shortName: "Sportygen Sanewadi",
      provider: "Sportygen",
      sport: "Badminton / court",
      sports: ["badminton"],
      url: "https://book.sportygen.in/venue/sportygen-sports-club-sanewadi",
      note: "A badminton court option shared by the community. Confirm court availability, slot duration and price on Sportygen before booking.",
      bookingSteps: [
        "Open Sportygen (book.sportygen.in) and select Sportygen Sports Club - Sanewadi.",
        "Select Badminton and the date.",
        "Select an available court and slot; verify the date, AM/PM and live availability.",
        "Pay through Sportygen and confirm the booking date, time and court."
      ],
      contact: {
        name: "",
        phone: ""
      }
    }
  ],
  gamePost: {
    defaultStart: "07:30",
    defaultEnd: "09:00",
    sports: [
      { id: "cricket", name: "Cricket", minPlayers: 8, maxPlayers: 8 },
      { id: "football", name: "Football", minPlayers: 8, maxPlayers: 10 },
      { id: "badminton", name: "Badminton", minPlayers: 4, maxPlayers: 6 },
      { id: "table-tennis", name: "Table Tennis", minPlayers: 2, maxPlayers: 4 }
    ]
  },
  photoBooth: {
    autoRotate: true,
    intervalMs: 6000
  },
  appearance: {
    defaultTheme: "light",
    defaultFont: "classic",
    defaultTextSize: "standard",
    idleDelayMs: 4500
  }
};
