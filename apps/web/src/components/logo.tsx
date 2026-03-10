import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** px size of the icon mark */
  size?: number;
  /** show "RankFlo" wordmark next to the icon */
  showText?: boolean;
  /** link destination — pass false to render a plain div */
  href?: string | false;
  className?: string;
}

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt="RankFlo"
      width={size}
      height={size}
      priority
      className="shrink-0"
    />
  );
}

function LogoInner({ size = 28, showText = true, className = "" }: Omit<LogoProps, "href">) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-bold tracking-tight text-gray-950 dark:text-white">
          RankFlo
        </span>
      )}
    </span>
  );
}

export function Logo({ size = 28, showText = true, href = "/", className = "" }: LogoProps) {
  if (href === false) {
    return <LogoInner size={size} showText={showText} className={className} />;
  }
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-bold tracking-tight text-gray-950 dark:text-white">
          RankFlo
        </span>
      )}
    </Link>
  );
}
