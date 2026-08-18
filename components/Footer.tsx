import SubscribeForm from "@/components/SubscribeForm";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/savvyexpat/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.72 3.72 0 01-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.21 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.79 2.2 12 2.2zm0 1.8c-3.15 0-3.52 0-4.76.07-1.08.05-1.67.23-2.06.38-.52.2-.89.44-1.28.83-.39.39-.63.76-.83 1.28-.15.39-.33.98-.38 2.06-.07 1.24-.07 1.61-.07 4.76s0 3.52.07 4.76c.05 1.08.23 1.67.38 2.06.2.52.44.89.83 1.28.39.39.76.63 1.28.83.39.15.98.33 2.06.38 1.24.07 1.61.07 4.76.07s3.52 0 4.76-.07c1.08-.05 1.67-.23 2.06-.38.52-.2.89-.44 1.28-.83.39-.39.63-.76.83-1.28.15-.39.33-.98.38-2.06.07-1.24.07-1.61.07-4.76s0-3.52-.07-4.76c-.05-1.08-.23-1.67-.38-2.06a2.9 2.9 0 00-.83-1.28 2.9 2.9 0 00-1.28-.83c-.39-.15-.98-.33-2.06-.38-1.24-.07-1.61-.07-4.76-.07zm0 3.06a4.94 4.94 0 110 9.88 4.94 4.94 0 010-9.88zm0 1.8a3.14 3.14 0 100 6.28 3.14 3.14 0 000-6.28zm5.15-3.11a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@TheSavvyExpat/videos",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100068192355504&sk=about",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="w-full sm:max-w-lg">
            <h2 className="text-2xl font-black leading-tight tracking-tight">
              Never Miss A Newsletter
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              Join 5,000+ expats and retirees getting the real inside scoop on
              the Philippines, straight to your inbox every week.
            </p>
            <div className="mt-6">
              <SubscribeForm variant="split" />
              <p className="mt-3 text-xs text-ink/45">
                No spam &middot; 100% free &middot; Unsubscribe anytime.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold">Connect</h2>
            <div className="mt-5 flex gap-4 sm:flex-col sm:gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-fit text-ink transition-colors duration-200 hover:text-primary"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-14 text-xs text-ink/40">
          &copy; {new Date().getFullYear()} The Savvy Expat LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
