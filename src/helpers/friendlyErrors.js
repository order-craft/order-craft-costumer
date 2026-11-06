// Translate a raw server error into something a customer can understand.
//
// Most backends reply with shapes like:
//   { error: "The edit window has expired." }
//   { message: "Order has already been started by the kitchen." }
//   { error: "Product with ID 5f3c2e... not found" }
//   { success: false, error: "from must be before to" }
//
// We map known phrases to customer-friendly copy, and fall back to a
// generic message for anything we don't recognize.

const FRIENDLY = [
  // Order workflow
  [/edit window has expired/i, "You can no longer modify this order. Please contact the waiter if you need help."],
  [/already been started by the kitchen/i, "Your order is already being prepared. It can no longer be changed."],
  [/only the owner can cancel/i, "This order is being prepared and cannot be cancelled. Please ask the waiter."],
  [/order is already cancelled/i, "This order has already been cancelled."],
  [/order is already archived/i, "This order is closed and cannot be changed."],
  [/order is already delivered/i, "This order has already been delivered."],
  [/order has already been paid/i, "This order has already been paid."],

  // Validation
  [/products are required/i, "Please add at least one item before placing the order."],
  [/invalid ordertype/i, "Please choose a valid order type."],
  [/product .* not found/i, "One of the items in your basket is no longer available. Please refresh the menu."],
  [/product is currently unavailable/i, "This item is currently unavailable. Please choose another one."],
  [/from must be before to/i, "The start date must come before the end date."],
  [/from and to are required/i, "Please choose both a start and end date."],

  // Auth / session
  [/no token provided/i, "Your session has expired. Please scan the QR code again."],
  [/invalid token/i, "Your session has expired. Please scan the QR code again."],
  [/table not found/i, "We couldn't find your table. Please scan the QR code again."],
  [/superclient not found/i, "This café is not available right now."],

  // Network
  [/network error/i, "We couldn't reach the café. Please check your connection and try again."],
  [/failed to fetch|networkerror/i, "We couldn't reach the café. Please check your connection and try again."],
  [/timeout/i, "The connection timed out. Please try again."],

  // Payment
  [/no payment method/i, "Please choose a payment method."],
  [/payment method not found/i, "The selected payment method is no longer available. Please pick another one."],
];

const GENERIC = "Something went wrong. Please try again, or ask the waiter for help.";

// Extract the raw message from an axios error / fetch error / plain object.
export const extractRawMessage = (err) => {
  if (!err) return "";
  if (typeof err === "string") return err;

  // Axios error
  if (err.response?.data) {
    const d = err.response.data;
    return d.error || d.message || d.msg || "";
  }

  // Custom error object with a .message
  if (err.message) return err.message;

  return "";
};

// Translate the raw message (or err) into a friendly customer-facing string.
export const friendlyErrorMessage = (err) => {
  const raw = extractRawMessage(err);
  if (!raw) return GENERIC;

  for (const [pattern, friendly] of FRIENDLY) {
    if (pattern.test(raw)) return friendly;
  }

  return GENERIC;
};