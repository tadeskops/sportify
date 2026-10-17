import("./app.js").catch(error => {
  console.error("[Sportify] Failed to load application modules.", error);
  const status = document.getElementById("loading-status");
  if (status) status.textContent = "The playbook could not load. Please reload or ask a resident coordinator to check the site files.";
});
