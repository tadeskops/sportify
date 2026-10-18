import { escapeHtml as e, openFromLink } from "./dom.js";
import { turfBookingGuidelines } from "./general.js";

export function renderContact(contact) {
  if (!contact || (!contact.name.trim() && !contact.phone)) return "";
  return `<div class="venue-contact"><span class="contact-label">Venue attendant</span>${contact.name.trim() ? `<strong>${e(contact.name)}</strong>` : ""}${contact.phone ? `<a href="tel:${e(contact.phone)}">Call ${e(contact.phone)}</a>` : ""}</div>`;
}

export function renderVenueSteps(venue) {
  if (!venue.bookingSteps) return "";
  return `<div class="venue-booking-steps"><h3>Booking steps on ${e(venue.provider)}</h3><ol>${venue.bookingSteps.map(step => `<li>${e(step)}</li>`).join("")}</ol><p><strong>Once confirmed:</strong> Notify the game group with the confirmed venue, date and time.</p></div>`;
}

export function renderBookingGuide(monthlyRotation) {
  return `<div class="booking-guide"><h3>Turf booking management</h3><ul>${turfBookingGuidelines.map(point => `<li>${e(point)}</li>`).join("")}</ul><h3>Booking checks</h3><ol>
    <li>${monthlyRotation ? "The month's booking coordinators" : "Agree a session coordinator to"} organise the booking and follow-up.</li>
    <li>Confirm the location, date, slot duration, team capacity, availability and total price on the provider's site.</li>
    <li>Check cancellation, rescheduling and weather/refund terms. Share deadlines with players before they commit.</li>
    <li>Book through the provider. Share the confirmed slot, location, booking reference and contribution in the game group.</li>
  </ol></div>
  <p class="venue-disclaimer">Listings do not reserve a slot. Check current details before paying. Keep private receipts and payment details off this public site.</p>`;
}

export function renderVenueDirectory(venues, monthlyRotation) {
  return `<section class="venues-section" id="venues" aria-labelledby="venues-title">
    <p class="eyebrow">FIND A PLACE TO PLAY</p><h2 id="venues-title">Where to book a turf.</h2>
    <p class="muted">Community-shared venue options. Booking happens on the provider's site, not on Sportify.</p>
    <div class="venue-grid">${venues.map(venue => `<article class="venue-card">
      <p class="eyebrow">${e(venue.provider)} / ${e(venue.sport)}</p><h3>${e(venue.name)}</h3>
      <p>${e(venue.note)}</p>${renderContact(venue.contact)}${renderVenueSteps(venue)}
      <a class="primary-link" href="${e(venue.url)}" target="_blank" rel="noopener noreferrer">View venue &amp; booking options &nearr;<span class="sr-only"> (opens in a new tab)</span></a>
    </article>`).join("")}</div>
    ${renderBookingGuide(monthlyRotation)}
  </section>`;
}

export function mountBookingPicker(venues, monthlyRotation) {
  const trigger = document.getElementById("book-turf");
  if (!trigger) return;
  const guideTrigger = document.getElementById("booking-guidelines");
  let returnFocus = trigger;
  const dialog = document.createElement("dialog");
  dialog.id = "booking-dialog";
  dialog.className = "booking-dialog";
  dialog.setAttribute("aria-labelledby", "booking-title");
  dialog.setAttribute("aria-describedby", "booking-description");
  dialog.innerHTML = `<div class="panel-heading"><h2 id="booking-title">Find your next turf</h2><button type="button" id="close-booking" aria-label="Close turf picker">&times;</button></div>
    <p id="booking-description" class="muted">Choose a turf, then book on the provider's site. Sportify does not reserve slots.</p>
    <label for="turf-select">Select a turf</label>
    <select id="turf-select">${venues.map(venue => `<option value="${e(venue.id)}">${e(venue.name)}</option>`).join("")}</select>
    <div id="selected-venue" aria-live="polite"></div>
    <details class="booking-help"><summary>Turf booking management</summary>${renderBookingGuide(monthlyRotation)}</details>`;
  document.body.append(dialog);
  const select = dialog.querySelector("#turf-select");
  const selected = dialog.querySelector("#selected-venue");
  function renderSelected() {
    const venue = venues.find(item => item.id === select.value);
    if (!venue) {
      console.error("[Sportify booking] Selected venue is not in the enabled list.");
      selected.innerHTML = '<p role="alert">This venue is unavailable. Please select a listed turf.</p>';
      return;
    }
    const contact = renderContact(venue.contact);
    selected.innerHTML = `<p class="venue-provider">${e(venue.provider)} / ${e(venue.sport)}</p><h3>${e(venue.name)}</h3><p class="muted">${e(venue.note)}</p>${contact || '<p class="muted contact-unlisted">No attendant contact is listed yet. Check the venue provider for contact details.</p>'}${renderVenueSteps(venue)}<a class="primary-link" href="${e(venue.url)}" target="_blank" rel="noopener noreferrer">Open booking on ${e(venue.provider)} &nearr;<span class="sr-only"> (opens in a new tab)</span></a>`;
  }
  renderSelected();
  select.addEventListener("change", renderSelected);
  function openBooking(source, showGuide) {
    returnFocus = source;
    dialog.querySelector(".booking-help").open = showGuide;
    dialog.showModal();
    dialog.scrollTop = 0;
    select.focus();
  }
  trigger.addEventListener("click", () => openBooking(trigger, false));
  guideTrigger?.addEventListener("click", () => openBooking(guideTrigger, true));
  openFromLink(dialog, "#book-turf", () => openBooking(trigger, false));
  dialog.querySelector("#close-booking").addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => returnFocus.focus());
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}
