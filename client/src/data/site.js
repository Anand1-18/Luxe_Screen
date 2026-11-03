// Static marketing content for the landing page and layout.

import { Cake, Gem, Heart, PartyPopper, Popcorn, Sparkles } from "lucide-react";

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

export const siteConfig = {
  name: "Luxe Screens",
  tagline: "Private theatres for life's biggest moments",
  description:
    "Book a private luxury theatre for birthdays, anniversaries, proposals and movie nights, complete with cakes, decor and gifts.",
  phone: "+91 90000 12345",
  email: "hello@luxescreens.in",
  hours: "Open daily, 10:00 AM – 11:30 PM",
  instagram: "https://instagram.com",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Theatres" },
  { href: "/ai-planner", label: "AI Planner" },
  { href: "/waitlist", label: "New Locations" },
];

export const heroSlides = [
  {
    image: unsplash("1489599849927-2ee91cede3ba"),
    eyebrow: "Private luxury theatres",
    title: "Your screen. Your story.",
    text: "Book an entire theatre for the people who matter, with 4K laser projection and Dolby Atmos.",
  },
  {
    image: unsplash("1530103862676-de8c9debad1d"),
    eyebrow: "Birthdays & celebrations",
    title: "Celebrate on the big screen",
    text: "Balloons, cakes and a personalised message on screen, all set up before you walk in.",
  },
  {
    image: unsplash("1518199266791-5375a83190b7"),
    eyebrow: "Proposals & anniversaries",
    title: "Make the moment unforgettable",
    text: "Rose petals, candle-light and your favourite film. We handle the details; you pop the question.",
  },
];

export const services = [
  {
    icon: Cake,
    title: "Birthday Parties",
    text: "Themed decor, designer cakes and a birthday message on the big screen.",
  },
  {
    icon: Heart,
    title: "Anniversaries & Dates",
    text: "Intimate suites with candle-light set-ups for just the two of you.",
  },
  {
    icon: Gem,
    title: "Proposals",
    text: "A choreographed reveal with roses, lights and a ring-ready moment.",
  },
  {
    icon: PartyPopper,
    title: "Friends & Bride-to-be",
    text: "Spacious halls, party lights and confetti for the whole squad.",
  },
  {
    icon: Popcorn,
    title: "Movie Marathons",
    text: "Stream anything on Netflix or Prime in 4K with cinema-grade sound.",
  },
  {
    icon: Sparkles,
    title: "Corporate Screenings",
    text: "Private premieres, team offsites and presentations with a stage and mic.",
  },
];

export const steps = [
  { title: "Pick a slot", text: "Choose your date, time and the theatre that fits your group." },
  {
    title: "Personalise",
    text: "Add cakes, decor and gifts, or let our AI planner choose for you.",
  },
  { title: "Celebrate", text: "Walk in to a fully set-up theatre. We take care of the rest." },
];

export const faqs = [
  {
    q: "How many people can a theatre hold?",
    a: "Our suites range from intimate rooms for 2–4 guests up to halls for 20. Each theatre's capacity is shown in the gallery and while booking.",
  },
  {
    q: "What's included in the base price?",
    a: "The base price covers a 3-hour private slot for the listed number of guests, including the screen, sound system and streaming apps. Extra guests are charged per person.",
  },
  {
    q: "Can I bring my own movie or content?",
    a: "Yes. Stream from Netflix, Prime Video and more, or bring your own content on a USB drive or laptop via HDMI.",
  },
  {
    q: "How long is a slot held while I pay?",
    a: "Once you proceed to payment we hold your slot for 10 minutes so nobody else can book it.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Reschedule for free up to 72 hours before your slot. Cancellations within 72 hours are non-refundable. Contact us and we'll help.",
  },
  {
    q: "Is outside food allowed?",
    a: "Cakes and decor must be ordered through us for safety and set-up. Snacks and beverages can be ordered at the venue.",
  },
];
