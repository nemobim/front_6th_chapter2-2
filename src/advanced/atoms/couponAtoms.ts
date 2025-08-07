import { atom } from "jotai";
import { Coupon } from "../../types";

export const couponsAtom = atom<Coupon[]>([]);
export const selectedCouponAtom = atom<Coupon | null>(null);
