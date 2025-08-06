import { useState } from "react";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "coupons">("products");

  return {
    isAdmin,
    setIsAdmin,
    activeTab,
    setActiveTab,
  };
};
