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

interface CartItem {
  size: string;
  color: string;
  colorId: string;
  quantity: number;
}

const cartCount = getElement("#cart-count");
const cartToggle = getElement<HTMLButtonElement>("#cart-toggle");
const cartDialog = getElement<HTMLDialogElement>("#cart-dialog");
const cartClose = getElement<HTMLButtonElement>("#cart-close");
const cartEmpty = getElement("#cart-empty");
const cartList = getElement<HTMLUListElement>("#cart-items");
const cartSummary = getElement("#cart-summary");
const cartTotal = getElement("#cart-total");
const toast = getElement("#toast");
const products = getElement("#products");
const productDetail = getElement("#product-detail");
const detailBack = getElement<HTMLButtonElement>("#detail-back");
const detailSize = getElement("#detail-size");
const detailTitle = getElement("#detail-title");
const detailImage = getElement<HTMLImageElement>("#detail-image");
const detailColorLabel = getElement("#detail-color-label");
const detailPrice = getElement<HTMLElement>("#detail-price");
const detailAddCart = getElement<HTMLButtonElement>("#detail-add-cart");
const detailColors =
  productDetail.querySelectorAll<HTMLButtonElement>(".detail-color");
const productCards = products.querySelectorAll<HTMLElement>(".product-card");

if (productCards.length !== 2) {
  throw new Error(`Expected two size cards, found ${productCards.length}`);
}

const cart: CartItem[] = [];
const itemPrice = Number(getDataValue(detailPrice, "price"));
if (!Number.isSafeInteger(itemPrice) || itemPrice <= 0) {
  throw new Error(`Invalid product price: ${getDataValue(detailPrice, "price")}`);
}
let toastTimer = 0;
let selectedSize = "";
let selectedColor = "Синий";
let lastOpenButton: HTMLButtonElement | null = null;

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

function updateCart(): void {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = String(count);
  cartToggle.setAttribute("aria-label", `Открыть корзину, товаров: ${count}`);
  cartEmpty.hidden = cart.length > 0;
  cartSummary.hidden = cart.length === 0;
  cartTotal.textContent = formatPrice(count * itemPrice);

  const items = cart.map((item, index) => {
    const productCard = Array.from(productCards).find(
      (card) => getDataValue(card, "size") === item.size,
    );
    const photo = productCard?.querySelector<HTMLImageElement>(".product-photo");
    if (!photo) {
      throw new Error(`Product photo not found for size ${item.size}`);
    }

    const row = document.createElement("li");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.className = "cart-item-image";
    image.src = photo.src;
    image.alt = "";
    image.dataset.color = item.colorId;
    row.append(image);

    const info = document.createElement("div");
    info.className = "cart-item-info";
    const title = document.createElement("strong");
    title.className = "cart-item-title";
    title.textContent = `Приманка ${item.size}`;
    const color = document.createElement("span");
    color.className = "cart-item-color";
    color.textContent = `Цвет: ${item.color}`;
    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.className = "cart-quantity-button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.index = String(index);
    decrease.setAttribute("aria-label", `Уменьшить количество: ${title.textContent}`);
    decrease.textContent = "−";

    const quantity = document.createElement("span");
    quantity.className = "cart-item-quantity";
    quantity.textContent = String(item.quantity);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.className = "cart-quantity-button";
    increase.dataset.cartAction = "increase";
    increase.dataset.index = String(index);
    increase.setAttribute("aria-label", `Увеличить количество: ${title.textContent}`);
    increase.textContent = "+";

    const price = document.createElement("span");
    price.className = "cart-item-price";
    price.textContent = formatPrice(item.quantity * itemPrice);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.dataset.cartAction = "remove";
    remove.dataset.index = String(index);
    remove.textContent = "Удалить";

    controls.append(decrease, quantity, increase, remove);
    info.append(title, color, price, controls);
    row.append(info);
    return row;
  });

  cartList.replaceChildren(...items);
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
  detailImage.dataset.color = getDataValue(button, "color");
  detailColorLabel.textContent = `Цвет приманки: ${selectedColor}`;

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
  const colorId = detailImage.dataset.color;
  if (!colorId) {
    throw new Error("Selected lure color is missing");
  }
  const existingItem = cart.find(
    (item) => item.size === selectedSize && item.colorId === colorId,
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ size: selectedSize, color: selectedColor, colorId, quantity: 1 });
  }
  updateCart();
  showToast(formatAddedMessage("Приманка", selectedSize, selectedColor));
});

cartToggle.addEventListener("click", () => {
  cartDialog.showModal();
  cartToggle.setAttribute("aria-expanded", "true");
});

cartClose.addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("close", () => {
  cartToggle.setAttribute("aria-expanded", "false");
});
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) {
    cartDialog.close();
  }
});

cartList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const button = event.target.closest<HTMLButtonElement>("[data-cart-action]");
  if (!button) {
    return;
  }
  const index = Number(getDataValue(button, "index"));
  const item = cart[index];
  if (!Number.isInteger(index) || !item) {
    throw new Error(`Cart item not found at index ${index}`);
  }

  const action = getDataValue(button, "cartAction");
  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease" && item.quantity > 1) {
    item.quantity -= 1;
  } else if (action === "decrease" || action === "remove") {
    cart.splice(index, 1);
  } else {
    throw new Error(`Unknown cart action: ${action}`);
  }
  updateCart();
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
