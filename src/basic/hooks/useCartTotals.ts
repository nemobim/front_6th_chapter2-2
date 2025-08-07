import { useMemo } from "react";
import { CartItem, Coupon } from "../../types";

interface CartTotals {
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
}

interface UseCartTotalsProps {
  cart: CartItem[];
  selectedCoupon: Coupon | null;
  calculateItemTotal: (item: CartItem) => number;
}

export const useCartTotals = ({ cart, selectedCoupon, calculateItemTotal }: UseCartTotalsProps): CartTotals => {
  return useMemo(() => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    cart.forEach((item) => {
      const itemPrice = item.product.price * item.quantity;
      totalBeforeDiscount += itemPrice;
      totalAfterDiscount += calculateItemTotal(item);
    });

    if (selectedCoupon) {
      if (selectedCoupon.discountType === "amount") {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount = Math.round(totalAfterDiscount * (1 - selectedCoupon.discountValue / 100));
      }
    }

    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount),
    };
  }, [cart, selectedCoupon, calculateItemTotal]);
};
