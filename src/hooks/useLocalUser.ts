import { useEffect, useState } from "react";
import { db, User as DbUser } from "@/lib/db";

export const useLocalUser = () => {
  const [localUser, setLocalUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocalUser = async () => {
      setLoading(true);
      const user = await db.user.orderBy("id").first();
      setLocalUser(user || null);
      setLoading(false);
    };

    fetchLocalUser();
  }, []);

  return { localUser, loading };
};
