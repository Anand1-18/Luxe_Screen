// Seed catalogue for Luxe Screens. Consumed by prisma/seed.js.
// Prices are written in rupees for readability and converted to paise on insert.

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

export const locations = [
  {
    slug: "hyderabad-jubilee-hills",
    name: "Jubilee Hills",
    city: "Hyderabad",
    address: "Road No. 36, Jubilee Hills, Hyderabad 500033",
    status: "ACTIVE",
  },
  {
    slug: "bengaluru-indiranagar",
    name: "Indiranagar",
    city: "Bengaluru",
    address: "100 Feet Road, Indiranagar, Bengaluru 560038",
    status: "ACTIVE",
  },
  { slug: "mumbai-bandra", name: "Bandra West", city: "Mumbai", status: "COMING_SOON" },
  { slug: "pune-koregaon-park", name: "Koregaon Park", city: "Pune", status: "COMING_SOON" },
  { slug: "delhi-hauz-khas", name: "Hauz Khas", city: "New Delhi", status: "COMING_SOON" },
];

export const slotTemplates = [
  { label: "Morning", startTime: "10:00", endTime: "13:00" },
  { label: "Afternoon", startTime: "13:30", endTime: "16:30" },
  { label: "Evening", startTime: "17:00", endTime: "20:00" },
  { label: "Night", startTime: "20:30", endTime: "23:30" },
];

export const theaters = [
  {
    slug: "velvet-room",
    locationSlug: "hyderabad-jubilee-hills",
    name: "The Velvet Room",
    tagline: "An intimate hideaway for two",
    description:
      "Plush velvet recliners, warm ambient lighting and a laser projector make this our most romantic suite. Ideal for proposals, anniversaries and date nights.",
    basePrice: 1499,
    includedGuests: 2,
    extraGuestPrice: 300,
    maxCapacity: 4,
    screen: '120" 4K Laser',
    sound: "Dolby Atmos 5.1.2",
    images: [
      unsplash("1489599849927-2ee91cede3ba"),
      unsplash("1593359677879-a4bb92f829d1"),
      unsplash("1585647347384-2593bc35786b"),
    ],
    amenities: ["Recliner seating", "Ambient mood lighting", "Private washroom", "Netflix & Prime"],
    rating: 4.9,
  },
  {
    slug: "golden-reel-suite",
    locationSlug: "hyderabad-jubilee-hills",
    name: "Golden Reel Suite",
    tagline: "Gold-trimmed comfort for small groups",
    description:
      "A warm, gold-accented suite built for birthdays and family movie nights, with a 150-inch screen and immersive overhead sound.",
    basePrice: 2499,
    includedGuests: 4,
    extraGuestPrice: 350,
    maxCapacity: 8,
    screen: '150" 4K HDR',
    sound: "Dolby Atmos 7.1.4",
    images: [
      unsplash("1574267432553-4b4628081c31"),
      unsplash("1595769816263-9b910be24d5f"),
      unsplash("1478720568477-152d9b164e26"),
    ],
    amenities: ["Sofa & recliner mix", "Gaming console", "Mini bar fridge", "Netflix & Prime"],
    rating: 4.8,
  },
  {
    slug: "grand-premiere-hall",
    locationSlug: "hyderabad-jubilee-hills",
    name: "Grand Premiere Hall",
    tagline: "Your own red-carpet premiere",
    description:
      "Our largest hall with stadium seating, a 180-inch laser screen and a stage area for speeches, performances or a surprise reveal.",
    basePrice: 4999,
    includedGuests: 10,
    extraGuestPrice: 300,
    maxCapacity: 20,
    screen: '180" 4K Laser',
    sound: "Dolby Atmos 9.2.4",
    images: [
      unsplash("1524712245354-2c4e5e7121c0"),
      unsplash("1517604931442-7e0c8ed2963c"),
      unsplash("1505373877841-8d25f7d46678"),
    ],
    amenities: ["Stadium seating", "Stage & mic", "Party lights", "Private lounge"],
    rating: 4.9,
  },
  {
    slug: "starlight-lounge",
    locationSlug: "bengaluru-indiranagar",
    name: "Starlight Lounge",
    tagline: "Movies under a sky full of stars",
    description:
      "A fibre-optic starry ceiling, cosy bean-bags and recliners create a dreamy setting for couples and close friends.",
    basePrice: 1999,
    includedGuests: 2,
    extraGuestPrice: 350,
    maxCapacity: 6,
    screen: '135" 4K Laser',
    sound: "Dolby Atmos 5.1.4",
    images: [
      unsplash("1593359677879-a4bb92f829d1"),
      unsplash("1601944179066-29786cb9d32a"),
      unsplash("1489599849927-2ee91cede3ba"),
    ],
    amenities: ["Starry ceiling", "Bean-bags & recliners", "Ambient lighting", "Netflix & Prime"],
    rating: 4.7,
  },
  {
    slug: "noir-studio",
    locationSlug: "bengaluru-indiranagar",
    name: "Noir Studio",
    tagline: "Sleek, dark and cinematic",
    description:
      "A minimalist black studio with acoustic panelling and a projector-first setup, loved by film buffs and friend groups.",
    basePrice: 2999,
    includedGuests: 4,
    extraGuestPrice: 350,
    maxCapacity: 10,
    screen: '160" 4K HDR',
    sound: "Dolby Atmos 7.2.4",
    images: [
      unsplash("1440404653325-ab127d49abc1"),
      unsplash("1595769816263-9b910be24d5f"),
      unsplash("1574267432553-4b4628081c31"),
    ],
    amenities: ["Acoustic panelling", "Gaming console", "Recliner seating", "Party lights"],
    rating: 4.8,
  },
  {
    slug: "royal-imperial",
    locationSlug: "bengaluru-indiranagar",
    name: "Royal Imperial",
    tagline: "Regal celebrations, big screen",
    description:
      "Rich red interiors, tiered seating and a dedicated celebration corner make this the go-to hall for milestone parties.",
    basePrice: 3999,
    includedGuests: 8,
    extraGuestPrice: 300,
    maxCapacity: 15,
    screen: '170" 4K Laser',
    sound: "Dolby Atmos 7.1.4",
    images: [
      unsplash("1524712245354-2c4e5e7121c0"),
      unsplash("1585647347384-2593bc35786b"),
      unsplash("1517604931442-7e0c8ed2963c"),
    ],
    amenities: ["Tiered seating", "Celebration corner", "Stage & mic", "Private washroom"],
    rating: 4.8,
  },
];

export const addOns = [
  // Cakes
  {
    slug: "chocolate-truffle-cake",
    name: "Chocolate Truffle",
    description: "Rich Belgian chocolate layers with a glossy ganache finish.",
    category: "CAKE",
    image: unsplash("1578985545062-69928b1d9587"),
    options: [
      { name: "Half kg", price: 649 },
      { name: "1 kg", price: 1149 },
    ],
  },
  {
    slug: "strawberry-cream-cake",
    name: "Strawberry Cream",
    description: "Light vanilla sponge with fresh cream and strawberries.",
    category: "CAKE",
    image: unsplash("1535141192574-5d4897c12636"),
    options: [
      { name: "Half kg", price: 699 },
      { name: "1 kg", price: 1249 },
    ],
  },
  {
    slug: "rainbow-sprinkle-cake",
    name: "Rainbow Sprinkle",
    description: "Colourful layered cake loaded with sprinkles, a birthday favourite.",
    category: "CAKE",
    image: unsplash("1464349095431-e9a21285b5f3"),
    options: [
      { name: "Half kg", price: 749 },
      { name: "1 kg", price: 1299 },
    ],
  },
  {
    slug: "cupcake-box",
    name: "Cupcake Box",
    description: "Assorted frosted cupcakes, perfect for sharing.",
    category: "CAKE",
    image: unsplash("1563729784474-d77dbb933a9e"),
    options: [
      { name: "Box of 6", price: 499 },
      { name: "Box of 12", price: 899 },
    ],
  },
  // Decor
  {
    slug: "balloon-bliss",
    name: "Balloon Bliss",
    description: "Metallic and pastel balloon clusters with a personalised banner.",
    category: "DECOR",
    image: unsplash("1530103862676-de8c9debad1d"),
    options: [
      { name: "Standard", price: 999 },
      { name: "Premium", price: 1799 },
    ],
  },
  {
    slug: "romantic-hearts",
    name: "Romantic Hearts",
    description: "Rose petals, heart balloons, candles and fairy lights.",
    category: "DECOR",
    image: unsplash("1518199266791-5375a83190b7"),
    options: [
      { name: "Standard", price: 1499 },
      { name: "Premium", price: 2499 },
    ],
  },
  {
    slug: "confetti-party",
    name: "Confetti Party",
    description: "Confetti cannons, party props and a sparkling backdrop.",
    category: "DECOR",
    image: unsplash("1492684223066-81342ee5ff30"),
    options: [
      { name: "Standard", price: 1199 },
      { name: "Premium", price: 1999 },
    ],
  },
  {
    slug: "candle-light-table",
    name: "Candle-light Table",
    description: "An elegant table set-up with florals, candles and fine tableware.",
    category: "DECOR",
    image: unsplash("1511795409834-ef04bbd61622"),
    options: [
      { name: "Table for 2", price: 1299 },
      { name: "Table for 6", price: 2299 },
    ],
  },
  // Gifts
  {
    slug: "rose-bouquet",
    name: "Rose Bouquet",
    description: "Hand-tied bouquet of fresh roses wrapped in premium paper.",
    category: "GIFT",
    image: unsplash("1550005809-91ad75fb315f"),
    options: [
      { name: "12 roses", price: 699 },
      { name: "24 roses", price: 1199 },
    ],
  },
  {
    slug: "chocolate-hamper",
    name: "Chocolate Hamper",
    description: "Curated artisanal chocolates in a keepsake box.",
    category: "GIFT",
    image: unsplash("1606312619070-d48b4c652a52"),
    options: [
      { name: "Classic", price: 899 },
      { name: "Luxury", price: 1499 },
    ],
  },
  {
    slug: "surprise-gift-box",
    name: "Surprise Gift Box",
    description: "A themed gift box with goodies chosen for the occasion.",
    category: "GIFT",
    image: unsplash("1549465220-1a8b9238cd48"),
    options: [
      { name: "Classic", price: 1199 },
      { name: "Deluxe", price: 1999 },
    ],
  },
  {
    slug: "golden-keepsake",
    name: "Golden Keepsake",
    description: "A gold-ribbon wrapped keepsake with a printed photo frame.",
    category: "GIFT",
    image: unsplash("1607344645866-009c320b63e0"),
    options: [{ name: "Standard", price: 799 }],
  },
];

export const coupons = [
  {
    code: "LUXE10",
    description: "10% off on bookings above ₹1,500 (up to ₹500)",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderAmount: 1500,
    maxDiscount: 500,
    validFrom: "2026-01-01T00:00:00+05:30",
    validUntil: "2027-12-31T23:59:59+05:30",
  },
  {
    code: "FIRSTSHOW",
    description: "Flat ₹300 off on your first show above ₹2,000",
    discountType: "FLAT",
    discountValue: 300,
    minOrderAmount: 2000,
    validFrom: "2026-01-01T00:00:00+05:30",
    validUntil: "2027-12-31T23:59:59+05:30",
  },
  {
    code: "CELEBRATE20",
    description: "20% off on celebrations above ₹4,000 (up to ₹1,000)",
    discountType: "PERCENT",
    discountValue: 20,
    minOrderAmount: 4000,
    maxDiscount: 1000,
    validFrom: "2026-01-01T00:00:00+05:30",
    validUntil: "2027-12-31T23:59:59+05:30",
    usageLimit: 500,
  },
  {
    code: "MONSOON25",
    description: "Expired monsoon offer (kept for testing validation)",
    discountType: "PERCENT",
    discountValue: 25,
    minOrderAmount: 1000,
    maxDiscount: 750,
    validFrom: "2026-06-01T00:00:00+05:30",
    validUntil: "2026-09-30T23:59:59+05:30",
  },
];
