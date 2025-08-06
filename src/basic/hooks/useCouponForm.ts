import { useState } from "react";

export const useCouponForm = () => {
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    name: "",
    code: "",
    discountType: "amount" as "amount" | "percentage",
    discountValue: 0,
  });

  /** 쿠폰 등록 폼 초기화 */
  const resetCouponForm = () => {
    setCouponForm({
      name: "",
      code: "",
      discountType: "amount",
      discountValue: 0,
    });
  };

  return {
    couponForm,
    setCouponForm,
    showCouponForm,
    setShowCouponForm,
    resetCouponForm,
  };
};
