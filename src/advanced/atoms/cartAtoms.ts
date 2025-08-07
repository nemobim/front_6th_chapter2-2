import { atom } from "jotai";
import { CartItem } from "../../types";
import { loadDataFromStorage } from "../utils/localStorageUtils";
import { selectedCouponAtom } from "./couponAtoms";
import { calculateDiscount, calculateItemTotal } from "../utils/cartCalculations";

// localStorage에서 초기값 로드
const initialCart = loadDataFromStorage<CartItem[]>("cart", []);

/** 장바구니 상태 */
export const cartAtom = atom<CartItem[]>(initialCart);

/** 장바구니 아이템 수 */
export const totalItemCountAtom = atom<number>((get) => {
  const cart = get(cartAtom);
  return cart.reduce((total, item) => total + item.quantity, 0);
});

/** 장바구니 총액 계산 atom */
export const cartTotalsAtom = atom((get) => {
  const cart = get(cartAtom);
  const selectedCoupon = get(selectedCouponAtom);

  // 기본 총액 계산
  const totals = cart.reduce(
    (acc, item) => {
      // 기본 총액 계산
      const itemPrice = item.product.price * item.quantity;
      // 할인 적용 총액 계산
      const itemTotal = calculateItemTotal(item, cart);

      return {
        totalBeforeDiscount: acc.totalBeforeDiscount + itemPrice,
        totalAfterDiscount: acc.totalAfterDiscount + itemTotal,
      };
    },
    { totalBeforeDiscount: 0, totalAfterDiscount: 0 }
  );

  // 쿠폰 할인 적용
  const finalTotalAfterDiscount = selectedCoupon ? calculateDiscount(totals.totalAfterDiscount, selectedCoupon) : totals.totalAfterDiscount;

  return {
    totalBeforeDiscount: Math.round(totals.totalBeforeDiscount),
    totalAfterDiscount: Math.round(finalTotalAfterDiscount),
  };
});
