import config from "../../config/site.js";
import { validateConfig } from "./config.js";
import { escapeHtml as e, icon } from "./dom.js";
import { generalRules } from "./general.js";
import { footballRules } from "./football.js";
import { mountRulebook } from "./rulebook.js";
import { mountAppearance } from "./appearance.js";
import { mountBackToTop } from "./back-to-top.js";
import { mountBookingPicker, renderVenueDirectory } from "./venues.js";

function renderSite() {
  const { community: c, features: f, links } = config;
  const badge = "assets/Sportify%20Community%20Sports%20Badge.png";
  const addressLogo = "assets/TaLogo.png";
  const whatsappEnabled = f.whatsapp && Boolean(links.whatsapp);
  const showSocialLinks = f.socialLinks && (whatsappEnabled || f.instagram);
  const whatsappLink = (label, className = "") => `<a class="${className}" href="${e(links.whatsapp)}" target="_blank" rel="noopener noreferrer">${icon("whatsapp")}<span>${label}</span><span class="sr-only"> (opens in a new tab)</span></a>`;
  const venues = f.venueBooking ? config.venues.filter(venue => venue.enabled) : [];
  document.title = `${c.name} | ${c.address} community sports`;
  document.getElementById("app").innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="./" aria-label="${e(c.name)} home"><img src="${badge}" width="52" height="52" alt=""><span>${e(c.name)}<small>${e(c.address)}</small></span></a>
        <div class="address-brand"><img src="${addressLogo}" width="38" height="38" alt="The Address logo"><span><strong>${e(c.address)}</strong><small>${e(c.location)}</small></span></div>
        <div class="header-actions">${f.bookingPicker && venues.length ? `<button type="button" class="book-turf" id="book-turf" aria-haspopup="dialog" aria-controls="booking-dialog">${icon("calendar")}<span>Book a turf</span></button>` : ""}<a class="header-link" href="${f.join ? "#join" : "#rule-book"}">${f.join ? "Join the next game" : "Read the rule book"} &nearr;</a></div>
      </header>
      <main id="main">
        <section class="hero" aria-labelledby="page-title">
          <div><p class="eyebrow">OUR COMMUNITY. OUR SHARED GROUND RULES.</p><h1 id="page-title" tabindex="-1">More than a game.<br>We're a community.</h1><p class="hero-lead">Different sports. Familiar faces. A resident-led community that respects everyone's time, plays fair, and makes room for each other.</p>
            <div class="hero-actions"><a class="primary-link" href="#rule-book">Read the rules &darr;</a>${f.join ? '<a href="#join">How to join a game &nearr;</a>' : ""}${venues.length ? f.bookingPicker ? '<button type="button" class="booking-guide-link" id="booking-guidelines" aria-haspopup="dialog" aria-controls="booking-dialog">How to book a turf &nearr;</button>' : '<a href="#venues">How to book a turf &nearr;</a>' : ""}</div>
            <p class="hero-meta"><span class="status-dot" aria-hidden="true"></span> By residents. For residents.</p>
          </div>
          <div class="hero-art"><img src="${badge}" alt="Sportify community sports badge" width="768" height="768"><span>MANY SPORTS. ONE COMMUNITY.</span></div>
        </section>
        <aside class="commitment"><span aria-hidden="true">&nearr;</span><div><strong>Your booking is your commitment.</strong><p>Confirm only when you can play. If something unavoidable comes up, tell the coordinator promptly.</p></div></aside>
        <div class="quick-rules" aria-label="Key deadlines"><div><span class="metric">24<small>h</small></span><span><strong>Cancel before the game</strong><small>Late backout? Pay unless replaced. Unavoidable circumstances, such as an emergency? No contribution share.</small></span></div><div><span class="metric">24<small>h</small></span><span><strong>Pay after the game</strong><small>Clear your contribution on time.</small></span></div><div><span class="metric">24<small>h</small></span><span><strong>Moderator: recheck before the game</strong><small>The turf booker is the game moderator. Recheck the listed player count 24 hours before play and arrange any booking changes.</small></span></div></div>
        <section class="book" id="rule-book" aria-labelledby="book-title">
          <p class="eyebrow">THE RULE BOOK</p><h2 id="book-title">One place for the ground rules.</h2><p id="book-description" class="muted"></p>
          <div class="rule-toolbar">
            ${f.football ? '<nav class="sport-nav" aria-label="Choose rule book"><button type="button" data-sport="general" aria-pressed="true">All sports / General</button><button type="button" data-sport="football" aria-pressed="false">Football</button></nav>' : ""}
            ${f.search ? '<div class="search-row"><div><label for="rule-search">Find a rule</label><input id="rule-search" type="search" placeholder="Try guest, payment, injury..." autocomplete="off"></div><button type="button" id="clear-search">Clear</button></div>' : ""}
          </div>
          ${f.search ? '<p class="search-status muted" id="search-status" role="status" aria-live="polite"></p>' : ""}
          <div class="reading-layout${f.sectionNavigation ? "" : " full-width"}">${f.sectionNavigation ? '<nav class="contents" id="rule-contents" aria-label="Rule sections"></nav>' : ""}<div><div id="rules"></div><div id="empty-state" class="empty-state" hidden><h3>No matching rules</h3><p>Try a broader search or clear it to see all sections.</p>${f.search ? '<button type="button" id="reset-search">Show all rules</button>' : ""}</div></div></div>
        </section>
        ${f.join ? `<section class="join-section" id="join" aria-labelledby="join-title"><div class="section-intro"><p class="eyebrow">START HERE</p><h2 id="join-title">How to join a game</h2></div><ol class="join-steps"><li><span class="step">01</span><h3>Join the WhatsApp group</h3>${whatsappEnabled ? whatsappLink("Join Sportify", "inline-social") : '<p>Ask a resident coordinator for group access.</p>'}</li><li><span class="step">02</span><h3>Choose next week's game</h3><p>Check the planned games for the following week: sport, venue, date, time, places and contribution.</p></li><li><span class="step">03</span><h3>Confirm your place</h3><p>Add your own name to the Main List only when confirmed to play. Unsure or full? Use the Waitlist.</p></li></ol><p class="join-note">Joining the group does not reserve a place. Wait for confirmation if you are waitlisted.</p></section>` : ""}
        ${venues.length && !f.bookingPicker ? renderVenueDirectory(venues, f.monthlyRotation) : ""}
        <section class="closing"><img class="closing-address" src="${addressLogo}" width="45" height="45" alt="The Address logo"><p class="eyebrow">OUR SHARED PROMISE</p><h2>Respect the time.<br>Enjoy the game.</h2><p>Show up. Play fair. Look out for each other.</p><a href="#page-title">Back to top &uarr;</a></section>
        <aside class="membership-note" aria-labelledby="membership-title"><h2 id="membership-title">Keeping the group active</h2><p>Inactive members will be removed from the WhatsApp group during routine reviews. You're always welcome to rejoin when you're ready to participate.</p></aside>
      </main>
      <footer><div class="footer-identity"><img src="${addressLogo}" width="30" height="30" alt=""><span>${e(c.name)} <small>${e(c.address)} &middot; ${e(c.location)}</small></span></div>${showSocialLinks ? `<nav class="social-links" aria-label="Community social links">${whatsappEnabled ? whatsappLink("Sportify WhatsApp") : ""}${f.instagram ? `<a href="${e(links.instagram)}" target="_blank" rel="noopener noreferrer">${icon("instagram")}<span>The Address Instagram</span><span class="sr-only"> (opens in a new tab)</span></a>` : ""}</nav>` : ""}<p class="footer-note">Updated ${e(c.updated)}</p></footer>
    </div><p id="preference-status" class="preference-status" role="status" aria-live="polite"></p>`;
  mountRulebook({ general: generalRules(f), football: footballRules, config });
  mountAppearance(config);
  if (f.backToTop) mountBackToTop();
  mountBookingPicker(venues, f.monthlyRotation);
}

try {
  validateConfig(config);
  renderSite();
} catch (error) {
  console.error("[Sportify] Unable to initialize site.", error);
  document.getElementById("app").innerHTML = `<main class="load-error"><h1>The playbook could not load</h1><p>Please reload. If this continues, ask a resident coordinator to check the site configuration.</p><p>${e(error.message)}</p></main>`;
}
