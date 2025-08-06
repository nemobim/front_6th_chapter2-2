import { useState, useCallback, useEffect } from "react";
import { Coupon } from "../../types";
import { initialCoupons } from "../constants/data";
import { useNotification } from "./useNotification";

interface UseCouponProps {
  cartTotals: { totalBeforeDiscount: number; totalAfterDiscount: number };
  setCart: (cart: any[]) => void;
  selectedCoupon: Coupon | null;
  setSelectedCoupon: (coupon: Coupon | null) => void;
}

export const useCoupon = ({ cartTotals, setCart, selectedCoupon, setSelectedCoupon }: UseCouponProps) => {
  const { showToast } = useNotification();
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem("coupons");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  // 🎫 쿠폰 관련 액션들
  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = cartTotals.totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === "percentage") {
        showToast("percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.", "error");
        return;
      }

      setSelectedCoupon(coupon);
      showToast("쿠폰이 적용되었습니다.", "success");
    },
    [showToast, cartTotals, setSelectedCoupon]
  );

  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    showToast(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, "success");
    setCart([]);
    setSelectedCoupon(null);
  }, [showToast, setCart, setSelectedCoupon]);

  const addCoupon = useCallback(
    (newCoupon: Coupon) => {
      const existingCoupon = coupons.find((c) => c.code === newCoupon.code);
      if (existingCoupon) {
        showToast("이미 존재하는 쿠폰 코드입니다.", "error");
        return;
      }
      setCoupons((prev) => [...prev, newCoupon]);
      showToast("쿠폰이 추가되었습니다.", "success");
    },
    [coupons, showToast]
  );

  const deleteCoupon = useCallback(
    (couponCode: string) => {
      setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      if (selectedCoupon?.code === couponCode) {
        setSelectedCoupon(null);
      }
      showToast("쿠폰이 삭제되었습니다.", "success");
    },
    [selectedCoupon, showToast, setSelectedCoupon]
  );

  // 💾 localStorage 동기화
  useEffect(() => {
    localStorage.setItem("coupons", JSON.stringify(coupons));
  }, [coupons]);

  return {
    coupons,
    selectedCoupon,
    setSelectedCoupon,
    applyCoupon,
    completeOrder,
    addCoupon,
    deleteCoupon,
  };
};
