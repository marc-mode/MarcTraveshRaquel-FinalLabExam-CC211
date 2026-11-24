const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-link");
const categoryButtons = document.querySelectorAll(".category-btn");
const drinkCards = document.querySelectorAll(".drink-card");
const orderItems = document.getElementById("orderItems");
const toast = document.getElementById("toast");
const orderForm = document.getElementById("orderForm");
const formFeedback = document.getElementById("formFeedback");

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navItems.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Highlight the navigation item for the section currently in view
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => sectionObserver.observe(section));

// Menu category filters
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    categoryButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    drinkCards.forEach(card => {
      const shouldShow = category === "all" || card.dataset.category === category;
      card.hidden = !shouldShow;
    });
  });
});

// Add drinks to the inquiry form instead of pretending to submit a real order
document.querySelectorAll(".add-btn").forEach(button => {
  button.addEventListener("click", () => {
    const drink = button.dataset.drink;
    const price = button.dataset.price;
    const line = `${drink} — ₱${price}`;
    const current = orderItems.value.trim();
    const existing = current.split("\n").find(item => item.startsWith(drink));
    if (existing) {
      const updated = current.split("\n").map(item => item.startsWith(drink)
        ? `${drink} — ₱${price} (add quantity)`
        : item).join("\n");
      orderItems.value = updated;
    } else {
      orderItems.value = current ? `${current}\n${line}` : line;
    }
    showToast(`${drink} added to your inquiry`);
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => orderItems.focus({ preventScroll: true }), 550);
  });
});

// Frontend-only inquiry confirmation: opens a prefilled email draft
orderForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  const data = new FormData(orderForm);
  const subject = encodeURIComponent("Mellow Cup order inquiry");
  const body = encodeURIComponent(
    `Hello Mellow Cup!\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nDrinks:\n${data.get("order")}\nEstimated cups: ${data.get("quantity")}\nOrder type: ${data.get("fulfillment")}\n\nThank you!`
  );
  formFeedback.textContent = "Your email draft is ready. Review it before sending!";
  showToast("Opening your email app with the inquiry details…");
  window.location.href = `mailto:hello@mellowcup.example?subject=${subject}&body=${body}`;
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", event => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", anchor.getAttribute("href"));
    }
  });
});
