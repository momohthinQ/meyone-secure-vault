import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRoleState {
  role: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isOfficer: boolean;
  isUser: boolean;
  isInstitution: boolean;
  institutionStatus: string | null;
  userId: string | null;
}

export function useUserRole(): UserRoleState {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [institutionStatus, setInstitutionStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setUserId(null);
          setInstitutionStatus(null);
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user"); // Default to user role
        } else {
          setRole(roleData?.role || "user");

          // If institution role, fetch institution status
          if (roleData?.role === "institution") {
            const { data: instData } = await supabase
              .from("institutions")
              .select("status")
              .eq("user_id", user.id)
              .maybeSingle();

            setInstitutionStatus(instData?.status || null);
          }
        }
      } catch (error) {
        console.error("Error in fetchRole:", error);
        setRole("user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    isLoading,
    isAdmin: role === "admin",
    isOfficer: role === "officer" || role === "admin",
    isUser: role === "user",
    isInstitution: role === "institution",
    institutionStatus,
    userId,
  };
}