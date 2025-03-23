"use client";

import React from "react";
import Link from "next/link";

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, label, icon }) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="transition-transform hover:scale-110 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg"
    >
      {icon}
    </Link>
  );
};

const SocialLinks: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-4 mt-6 mb-4">
      <SocialLink
        href="https://x.com/kjut4q"
        label="Twitter"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        }
      />
      <SocialLink
        href="https://warpcast.com/qendresa"
        label="Farcaster"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 192 192"
            fill="currentColor"
          >
            <path d="M151.69,116.36c0,16.49-10.93,29.84-24.39,29.84s-24.39-13.35-24.39-29.84,10.92-29.85,24.39-29.85,24.39,13.36,24.39,29.85ZM96,75.64c-13.47,0-24.39,13.36-24.39,29.85s10.93,29.84,24.39,29.84,24.39-13.35,24.39-29.84S109.46,75.64,96,75.64ZM16.22,105.49c0,16.49,10.93,29.84,24.39,29.84s24.39-13.35,24.39-29.84S54.08,75.64,40.61,75.64,16.22,89,16.22,105.49ZM96,30.14c-13.47,0-24.39,13.35-24.39,29.84S82.54,89.83,96,89.83s24.39-13.35,24.39-29.85S109.46,30.14,96,30.14Z" />
          </svg>
        }
      />
      <SocialLink
        href="https://qendresa.dev/"
        label="Personal Website"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        }
      />
    </div>
  );
};

export default SocialLinks;
