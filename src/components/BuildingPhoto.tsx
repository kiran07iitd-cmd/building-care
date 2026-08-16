import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { buildingPhotoSignedUrl } from "@/lib/building-photo";

export function BuildingPhoto({
  path,
  alt,
  iconClassName = "h-12 w-12",
}: {
  path: string | null | undefined;
  alt: string;
  iconClassName?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setUrl(null);
    buildingPhotoSignedUrl(path)
      .then((u) => {
        if (active) setUrl(u);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <Building2 className={`${iconClassName} opacity-90`} />
    </div>
  );
}
