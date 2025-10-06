import { twMerge } from "tailwind-merge";

export const UsersIcon = (props: { className?: string }) => (
  <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512"
    style={{ opacity: 1 }}
    className={twMerge("inline text-white", props.className)}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
  >
    <g>
      <polygon points="61.549,88.131 0,88.131 0,423.869 61.549,423.869 61.549,339.934 450.442,339.934 450.442,423.869 
		511.992,423.869 511.992,339.934 512,339.934 512,267.188 61.549,267.188 	"
        style={{ fill: 'currentColor' }}
      ></polygon>
      <path d="M459.656,146.18H237.82v87.434H512v-35.09C512,169.615,488.566,146.18,459.656,146.18z"
        style={{ fill: 'currentColor' }}
      ></path>
      <circle cx="139.541" cy="191.992" r="47.91"
        style={{ fill: 'currentColor' }}
      ></circle>
    </g>
  </svg>
);
