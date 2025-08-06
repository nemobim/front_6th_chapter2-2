import { Coupon } from "../../types";

/** 최소 할인 금액 설정 */
const MIN_PERCENTAGE_COUPON_AMOUNT = 10000;

/** 쿠폰 적용 가능 여부 검증 */
export const validateCouponApplication = (coupon: Coupon, currentTotal: number) => {
  if (currentTotal < MIN_PERCENTAGE_COUPON_AMOUNT && coupon.discountType === "percentage") {
    return false;
  }
  return true;
};

/** 쿠폰 코드 중복 검증 */
export const validateCouponCode = (newCoupon: Coupon, existingCoupons: Coupon[]) => {
  if (existingCoupons.find((c) => c.code === newCoupon.code)) {
    return false;
  }
  return true;
};
