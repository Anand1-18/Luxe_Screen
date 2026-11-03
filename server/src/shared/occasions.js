export const OCCASION_LABELS = {
  BIRTHDAY: "Birthday",
  ANNIVERSARY: "Anniversary",
  PROPOSAL: "Proposal",
  DATE_NIGHT: "Date Night",
  BRIDE_TO_BE: "Bride / Groom to be",
  FRIENDS_PARTY: "Friends Party",
  MOVIE_NIGHT: "Movie Night",
  CORPORATE: "Corporate Event",
  OTHER: "Other",
};

export const CATEGORY_LABELS = { CAKE: "Cakes", DECOR: "Decor", GIFT: "Gifts" };

export const PAYMENT_METHOD_LABELS = {
  UPI: "UPI",
  CARD: "Card",
  NET_BANKING: "Net Banking",
};

/** Which occasion-detail fields make sense for each occasion. */
export const OCCASION_FIELDS = {
  BIRTHDAY: { honoree: "Birthday person's name", age: true },
  ANNIVERSARY: { honoree: "Partner 1 name", partner: "Partner 2 name" },
  PROPOSAL: { honoree: "Your name", partner: "Your partner's name" },
  DATE_NIGHT: { honoree: "Your name", partner: "Your date's name" },
  BRIDE_TO_BE: { honoree: "Bride / Groom's name" },
  FRIENDS_PARTY: { honoree: "Group or host name" },
  MOVIE_NIGHT: {},
  CORPORATE: { honoree: "Company / team name" },
  OTHER: { honoree: "Who are we celebrating?" },
};
