import { PAYMENT_METHODS } from "../../data/constants";

export const CHECKOUT_PAYMENT_METHODS = PAYMENT_METHODS.filter(
  (method) => method.id === "pix" || method.id === "card",
);
