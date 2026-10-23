import "../scss/style.scss";
import { formatAddedMessage } from "./messages.js";

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return element;
}

function getDataValue(element: HTMLElement, key: string): string {
  const value = element.dataset[key];
  if (!value) {
    throw new Error(`Required data-${key} attribute is missing`);
  }
  return value;
}

const cartCount = getElement("#cart-count");
const toast = getElement("#toast");
let cartItems = 0;
let toastTimer = 0;

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelectorAll<HTMLButtonElement>(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");

    document.querySelectorAll<HTMLElement>(".product-card").forEach((card) => {
      card.hidden =
        button.dataset.category !== "all" &&
        card.dataset.category !== button.dataset.category;
    });
  });
});

document.querySelectorAll<HTMLButtonElement>(".add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest<HTMLElement>(".product-card");
    if (!card) {
      throw new Error("Cart button must be inside a product card");
    }

    const name = getElementWithin(card, ".product-title").textContent?.trim();
    const size = getElementWithin(card, ".size-option.active");
    const color = getElementWithin(card, ".color-option.active");
    if (!name) {
      throw new Error("Product title must not be empty");
    }

    cartItems += 1;
    cartCount.textContent = String(cartItems);
    showToast(
      formatAddedMessage(
        name,
        getDataValue(size, "size"),
        getDataValue(color, "color"),
      ),
    );
  });
});

function getElementWithin<T extends HTMLElement>(
  parent: ParentNode,
  selector: string,
): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required element not found within product card: ${selector}`);
  }
  return element;
}

document
  .querySelectorAll<HTMLButtonElement>(".size-option, .color-option")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const options = button.parentElement?.querySelectorAll("button");
      if (!options) {
        throw new Error("Selection button must have an options container");
      }

      options.forEach((option) => {
        const selected = option === button;
        option.classList.toggle("active", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
    });
  });

document.querySelectorAll<HTMLButtonElement>(".favorite").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.classList.toggle("selected");
    button.setAttribute(
      "aria-label",
      selected ? "Убрать из избранного" : "Добавить в избранное",
    );
    showToast(selected ? "Добавили в избранное" : "Убрали из избранного");
  });
});

const subscribeForm = getElement<HTMLFormElement>("#subscribe-form");
subscribeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Спасибо за подписку!");
  subscribeForm.reset();
});

const menuToggle = getElement<HTMLButtonElement>("#menu-toggle");
const mainNav = getElement<HTMLElement>("#main-nav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
});

mainNav.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  });
});
