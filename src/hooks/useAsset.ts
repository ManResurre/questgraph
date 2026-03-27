import { useEffect, useState } from "react";
import { Assets, LoadOptions } from "pixi.js";

export function useAsset<T = any>(
  url: string,
  options?: LoadOptions,
): T | null {
  const [asset, setAsset] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await Assets.load<T>(url, options);
        if (!cancelled) {
          setAsset(loaded);
        }
      } catch (error) {
        console.error(`Failed to load asset: ${url}`, error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, options]);

  return asset;
}
