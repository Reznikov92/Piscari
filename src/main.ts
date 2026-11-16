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
const products = getElement("#products");
const productDetail = getElement("#product-detail");
const detailBack = getElement<HTMLButtonElement>("#detail-back");
const detailSize = getElement("#detail-size");
const detailTitle = getElement("#detail-title");
const detailVisual = getElement("#detail-visual");
const detailImage = getElement<HTMLImageElement>("#detail-image");
const detailColorLabel = getElement("#detail-color-label");
const detailAddCart = getElement<HTMLButtonElement>("#detail-add-cart");
const detailColors =
  productDetail.querySelectorAll<HTMLButtonElement>(".detail-color");
const productCards = products.querySelectorAll<HTMLElement>(".product-card");

if (productCards.length !== 2) {
  throw new Error(`Expected two size cards, found ${productCards.length}`);
}

let cartItems = 0;
let toastTimer = 0;
let selectedSize = "";
let selectedColor = "Белый";
let lastOpenButton: HTMLButtonElement | null = null;

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function openDetails(button: HTMLButtonElement): void {
  selectedSize = getDataValue(button, "size");
  const selectedCard = Array.from(productCards).find(
    (card) => getDataValue(card, "size") === selectedSize,
  );
  const selectedPhoto = selectedCard?.querySelector<HTMLImageElement>(".product-photo");
  if (!selectedPhoto) {
    throw new Error(`Product photo not found for size ${selectedSize}`);
  }

  detailSize.textContent = selectedSize;
  detailTitle.textContent = `Приманка ${selectedSize}`;
  detailImage.src = selectedPhoto.src;
  detailImage.alt = selectedPhoto.alt;
  lastOpenButton = button;
  products.hidden = true;
  productDetail.hidden = false;
  selectDetailColor(detailColors[0]);
  detailBack.focus();
}

function selectDetailColor(button: HTMLButtonElement): void {
  selectedColor = getDataValue(button, "name");
  const background = getDataValue(button, "background");
  detailVisual.style.backgroundColor = background;
  detailVisual.classList.toggle("red-background", selectedColor === "Красный");
  detailColorLabel.textContent = `Цвет фона: ${selectedColor}`;

  detailColors.forEach((option) => {
    const selected = option === button;
    option.classList.toggle("active", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
}

document.querySelectorAll<HTMLButtonElement>(".product-open").forEach((button) => {
  button.addEventListener("click", () => openDetails(button));
});

productCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    const openButton = card.querySelector<HTMLButtonElement>(".product-open");
    if (!openButton) {
      throw new Error("Product card must contain a details button");
    }
    openDetails(openButton);
  });
});

detailColors.forEach((button) => {
  button.addEventListener("click", () => selectDetailColor(button));
});

detailBack.addEventListener("click", () => {
  productDetail.hidden = true;
  products.hidden = false;
  lastOpenButton?.focus();
});

detailAddCart.addEventListener("click", () => {
  cartItems += 1;
  cartCount.textContent = String(cartItems);
  showToast(formatAddedMessage("Приманка", selectedSize, selectedColor));
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
