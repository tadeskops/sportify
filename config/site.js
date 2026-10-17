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
      contact: {
        name: "",
        phone: ""
      }
    }
  ],
  appearance: {
    defaultTheme: "light",
    defaultFont: "classic",
    defaultTextSize: "standard",
    idleDelayMs: 4500
  }
};
