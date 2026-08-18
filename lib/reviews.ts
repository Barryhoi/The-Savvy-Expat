// Content for /reviews, pulled from thesavvyexpatreviews.com — the same
// real clients as lib/testimonials.ts, just the larger set built for a
// dedicated reviews page. Never invent additional testimonials.

import type { Quote } from "@/lib/testimonials";

export interface ReviewVideo {
  id: string;
  name: string;
  location: string;
}

export const REVIEW_VIDEOS: ReviewVideo[] = [
  { id: "BR9s7JiFz4M", name: "Barry", location: "Florida" },
  { id: "wEUXTYDoAn4", name: "Bruce", location: "Wisconsin" },
  { id: "P8bG3fmIsaM", name: "Mart", location: "Texas" },
  { id: "1I0L7_NliJo", name: "Bryan", location: "California" },
  { id: "--GcdHibbnA", name: "Ralph", location: "California" },
  { id: "VTxImUMsmsU", name: "Anthony", location: "Seattle" },
  { id: "wAVI1xB6h3g", name: "Ray", location: "Florida" },
  { id: "Ix6FOK6YuXg", name: "Ken", location: "Virginia" },
  { id: "cYnxScVsGmg", name: "Darryl", location: "Australia" },
];

// These written reviews have no client photo on the source site, unlike
// lib/testimonials.ts's QUOTES — Quote.avatar is optional for exactly this.
export const WRITTEN_REVIEWS: Quote[] = [
  {
    name: "Robert",
    quote:
      "Everything you and your staff do makes this transition so much easier, less stressful, and more beneficial than I can put into words. I prayed to God to find the right path and he put me in yours.",
  },
  {
    name: "James",
    quote:
      "In less than a week I had an amazing condo, my visa extension in the works, WiFi set up, and we were already touring international schools for my son. I didn't think that was possible. Thank you.",
  },
  {
    name: "William Rockwell",
    quote:
      "Your service is worth every penny. Johnard went above and beyond, Julie is incredibly sharp and kind hearted, and every single person on your team has been exceptional. It's a pleasure to have you all as friends.",
  },
  {
    name: "Todd",
    quote:
      "They had my NBI scheduled, my medical handled, and an appointment set with the US Embassy. Top notch quality across the board. I'm super impressed with your entire team and I'm extremely happy.",
  },
  {
    name: "Darryl",
    quote:
      "Everything is going extremely well. I couldn't have done this on my own. Nothing is too much trouble for your staff, they are a great team, and I'm so glad I decided to go with you.",
  },
  {
    name: "Austin",
    quote:
      "One aspect of your service alone saves enough to pay for the entire fee. You should be the first number every expat calls. Why do it all yourself when the whole point is to make your life easier?",
  },
  {
    name: "Michael",
    quote:
      "I'm not sure we could have found a home of this caliber on our own. We're settled in, our things are delivered, and we couldn't have done any of it without you and your team.",
  },
  {
    name: "Walter Mosher",
    quote:
      "Moving to Asia to find a new home and retire was my 2024 New Year's resolution. I honestly didn't know if I'd follow through. Now here I am, settled in my new place. Dreams do come true.",
  },
  {
    name: "Sean McKinney",
    quote:
      "You coordinated special needs foods for our youngest grandchild from day one. That's the kind of detail that tells you everything about who you're working with. I can't thank you enough.",
  },
  {
    name: "Patricia",
    quote:
      "We watched your YouTube channel for months before reaching out. You helped us fulfill our dream of retiring in the Philippines with exactly the lifestyle we always wanted. Thank you so much.",
  },
  {
    name: "David",
    quote:
      "I was skeptical at first. Plenty of people online claim to help expats relocate and most of them are just talking. Evan and his team actually delivered on every single thing they promised. That's rare.",
  },
  {
    name: "Brian",
    quote:
      "Daykx has been coordinating everything to make sure my rent situation goes smoothly, and she is just incredible. Your whole team operates at a level I've never experienced from any company before.",
  },
  {
    name: "Karen",
    quote:
      "I moved here alone at 61 years old and I was terrified. Evan's team made sure I was never alone in the process. From the airport to my condo to my first grocery run, someone was always there. I feel completely at home.",
  },
  {
    name: "Mark",
    quote:
      "He and his staff have been professional and responsive to every concern. I'm moving into a condo they vetted for me, with services I never would have known to look for. I highly recommend without hesitation.",
  },
  {
    name: "Ted LaSalvia",
    quote:
      "Thank you for arranging everything so smoothly. I got from the airport to my condo without a single issue and the whole check-in process went perfectly. This is exactly what I needed.",
  },
  {
    name: "Ray",
    quote:
      "I've lived in five countries and hired people to help with relocation before. Nobody has ever come close to the level of service I got here. Evan's team doesn't just help you move, they help you actually land.",
  },
  {
    name: "Dennis",
    quote:
      "I'm sitting at a beach in the Philippines right now that I never would have found on my own. You know how to make an old man's dreams come true. Happy endings do exist.",
  },
  {
    name: "Steve",
    quote:
      "The house tour shortlist they put together saved us at least three weeks of wasted trips. We landed on a place we genuinely love and I credit the team entirely for that.",
  },
  {
    name: "Shawn Thorpe",
    quote:
      "I didn't think any of this was possible for someone like me. Jesy worked so hard to make it happen and even got me out of my comfort zone in the best way. I am beyond grateful.",
  },
  {
    name: "Richard",
    quote:
      "I told my brother back home that hiring Savvy Expat was the best money I spent on this entire move. Not a close second. The best. Everything else was a cost. This was an investment.",
  },
];
