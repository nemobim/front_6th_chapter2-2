import { atom } from "jotai";
import { Coupon } from "../../types";
import { initialCoupons } from "../constants/data";

/** 쿠폰 목록 */
export const couponsAtom = atom<Coupon[]>(initialCoupons);

/** 선택된 쿠폰 */
export const selectedCouponAtom = atom<Coupon | null>(null);
