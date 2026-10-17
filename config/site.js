export default {
  community: {
    name: "Sportify",
    address: "The Address",
    location: "Aundh-Baner Link Road",
    updated: "17 October 2026"
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
    football: true,
    search: true,
    sectionNavigation: true,
    backToTop: true,
    photoBooth: true,
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
      provider: "PlaySpots",
      sport: "Football / turf",
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
    }
  ],
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
