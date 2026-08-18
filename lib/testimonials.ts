// Real client proof, shared by the homepage and the booking funnel.
// Every name, photo and quote here comes from the live site — never invent
// additional testimonials or swap a real name for a placeholder.

export interface TestimonialVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export const TESTIMONIAL_VIDEOS: TestimonialVideo[] = [
  {
    id: "wEUXTYDoAn4",
    title: "Client story — making the move to the Philippines",
    thumbnail: "/thumbnails/2.png",
  },
  {
    id: "P8bG3fmIsaM",
    title: "Client story — relocating with The Savvy Expat",
    thumbnail: "/thumbnails/3.png",
  },
  {
    id: "1I0L7_NliJo",
    title: "Client story — settling into the Philippines",
    thumbnail: "/thumbnails/4.png",
  },
  {
    id: "--GcdHibbnA",
    title: "Client story — a seamless transition",
    thumbnail: "/thumbnails/5.png",
  },
  {
    id: "VTxImUMsmsU",
    title: "Client story — life after the move",
    thumbnail: "/thumbnails/6.png",
  },
];

export interface Quote {
  quote: string;
  name: string;
  /** Some reviews (e.g. the /reviews page's larger written set) have no photo. */
  avatar?: string;
}

export const QUOTES: Quote[] = [
  {
    quote:
      "Wow, Evan made the entire process painless for me and did a great job finding locations.",
    name: "Ralph",
    avatar: "https://framerusercontent.com/images/5t3oKPQAcUOjvZP6MgF5jQDc.png",
  },
  {
    quote:
      "Evan made it simple and easy to find my feet in the Philippines and find a unit. Anything I needed they answered right away.",
    name: "Mart",
    avatar: "https://framerusercontent.com/images/65kgczt0JYXdJXx0gZIWnsTr398.jpg",
  },
  {
    quote:
      "Working with Evan meant I didn't have to waste my time. Evan's team found me everything I needed.",
    name: "Michael",
    avatar: "https://framerusercontent.com/images/o9H55O9cRk4PKjUag1pDC6sGz0c.png",
  },
  {
    quote:
      "I almost tried to do it myself but I'm so glad I went with Evan's service because so many things I never anticipated popped up.",
    name: "Bruce",
    avatar: "https://framerusercontent.com/images/EXRp4kM5BwH3zBzcr0x8qmoY.jpg",
  },
  {
    quote:
      "I can't put a price on the peace of mind Evan has given me. There was so many things to worry about so it just made sense.",
    name: "Anthony",
    avatar: "https://framerusercontent.com/images/AkZiX3idgcxE9PrLmgCoQqTO4mE.jpg",
  },
  {
    quote:
      "I needed to find a place to stay, Evan and his team took care of that quickly. I was super happy with the spot!",
    name: "Bryan",
    avatar: "https://framerusercontent.com/images/wGzLlL1YpLM8D7nsc5yH2I4CKY.jpg",
  },
];
