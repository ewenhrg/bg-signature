import { Link } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import { buildWhatsAppReserveUrl, getWhatsAppNumber } from "@/lib/whatsapp";

type Props = {
  activityName: string;
  activityPath: string;
  className?: string;
};

export function ReserveButton({ activityName, activityPath, className = "" }: Props) {
  const { locale, tr } = useLocale();
  const number = getWhatsAppNumber();
  const absoluteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${activityPath}`
      : activityPath;

  // Without a configured number the button degrades to the contact page rather
  // than showing visitors a configuration warning. The Contact page states it.
  if (!number) {
    return (
      <Link to={`/${locale}/contact`} className={`btn btn-primary ${className}`}>
        <WhatsAppIcon />
        {tr("reserve")}
      </Link>
    );
  }

  const href = buildWhatsAppReserveUrl({
    locale,
    activityName,
    activityUrl: absoluteUrl,
  });

  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-primary ${className}`}
    >
      <WhatsAppIcon />
      {tr("reserve")}
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[1.15em] w-[1.15em]"
    >
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.13-.42-2.15-1.33-.8-.71-1.34-1.59-1.49-1.89-.15-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.06 2.86 1.21 3.06.15.2 2.09 3.19 5.06 4.35 2.47.96 2.97.77 3.51.72.54-.05 1.74-.71 1.98-1.4.25-.68.25-1.27.18-1.39-.07-.12-.27-.2-.57-.35zM12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.4 1.26 4.83L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.19h.01c5.5 0 9.95-4.46 9.95-9.96S17.54 2 12.04 2zm0 18.02a8.05 8.05 0 0 1-4.1-1.12l-.29-.17-3.05.8.81-2.97-.19-.31a8.03 8.03 0 0 1-1.23-4.29c0-4.44 3.61-8.06 8.06-8.06 2.15 0 4.17.84 5.69 2.36a8 8 0 0 1 2.36 5.7c0 4.45-3.62 8.06-8.06 8.06z" />
    </svg>
  );
}
