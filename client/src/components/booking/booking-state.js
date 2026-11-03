// Booking wizard state: a single reducer so every step reads and writes one
// source of truth, which is also persisted to sessionStorage between reloads.

export const STEPS = [
  "Date & Time",
  "Theatre",
  "Your Details",
  "Occasion",
  "Cakes",
  "Decor",
  "Gifts",
  "Payment",
  "Confirmed",
];

/** Builds the SELECT_THEATER action from an availability entry (drops the per-slot list). */
export function selectTheater(theater, slot) {
  const { slots, ...dto } = theater;
  const { status, ...slotInfo } = slot;
  return { type: "SELECT_THEATER", theater: dto, slot: slotInfo };
}

export function createInitialState(init) {
  return {
    step: 1,
    maxStep: 1,
    location: init.location,
    date: init.today,
    guests: init.guests ?? 2,
    startTime: null,
    theater: null,
    slot: null,
    preferredTheaterId: init.preferredTheaterId ?? null,
    customer: { name: "", phone: "", email: "" },
    occasion: init.occasion ?? null,
    occasionDetails: {},
    specialRequests: "",
    cart: init.cart ?? {},
    coupon: null,
    paymentMethod: "UPI",
    pending: null,
    booking: null,
  };
}

const clearSlot = { startTime: null, theater: null, slot: null };

export function wizardReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "GO":
      return {
        ...state,
        step: action.step,
        maxStep: Math.max(state.maxStep, action.step),
      };
    case "SET_LOCATION":
      return action.location === state.location
        ? state
        : { ...state, location: action.location, ...clearSlot };
    case "SET_DATE":
      return action.date === state.date ? state : { ...state, date: action.date, ...clearSlot };
    case "SET_GUESTS": {
      const tooSmall = state.theater && state.theater.maxCapacity < action.guests;
      return {
        ...state,
        guests: action.guests,
        ...(tooSmall ? { theater: null, slot: null } : {}),
      };
    }
    case "SELECT_TIME":
      return action.startTime === state.startTime
        ? state
        : { ...state, startTime: action.startTime, theater: null, slot: null };
    case "SELECT_THEATER":
      return {
        ...state,
        theater: action.theater,
        slot: action.slot,
        startTime: action.slot.startTime,
      };
    case "CLEAR_SLOT":
      return { ...state, ...clearSlot, pending: null, step: 1 };
    case "SET_CUSTOMER":
      return { ...state, customer: action.customer };
    case "SET_OCCASION":
      return {
        ...state,
        occasion: action.occasion,
        occasionDetails: action.occasionDetails,
        specialRequests: action.specialRequests,
      };
    case "SET_CART_ITEM": {
      const cart = { ...state.cart };
      if (action.entry) cart[action.addOnId] = action.entry;
      else delete cart[action.addOnId];
      return { ...state, cart };
    }
    case "SET_COUPON":
      return { ...state, coupon: action.coupon };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_PENDING":
      return { ...state, pending: action.pending };
    case "CONFIRMED":
      return { ...state, booking: action.booking, pending: null, step: 9, maxStep: 9 };
  }
}

/** The create-booking payload; also used to detect when a pending hold no longer matches the cart. */
export function toBookingPayload(state) {
  return {
    theaterId: state.theater?.id ?? "",
    slotId: state.slot?.id ?? "",
    date: state.date,
    guests: state.guests,
    customer: state.customer,
    occasion: state.occasion ?? "OTHER",
    occasionDetails: state.occasionDetails,
    specialRequests: state.specialRequests || undefined,
    items: Object.values(state.cart).map(({ optionId, quantity }) => ({ optionId, quantity })),
    couponCode: state.coupon?.code,
  };
}

export const STORAGE_KEY = "luxe-booking-v1";

export function loadStoredState(today) {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || typeof state.step !== "number") return null;
    // A stale draft from a previous day loses its date and slot.
    if (state.step !== 9 && state.date < today)
      return { ...state, date: today, ...clearSlot, pending: null, step: 1, maxStep: 1 };
    return state;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode); the wizard still works in memory.
  }
}

export function clearStoredState() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
