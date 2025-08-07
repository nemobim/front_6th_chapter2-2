import { useAtom } from "jotai";
import { useCallback } from "react";
import { Coupon } from "../../../../types";
import { cartAtom } from "../../../atoms/cartAtoms";
import { selectedCouponAtom } from "../../../atoms/couponAtoms";
import { useCart } from "../../../hooks/useCart";
import { useCartTotals } from "../../../hooks/useCartTotals";
import { useNotification } from "../../../hooks/useNotification";
import { useProduct } from "../../../hooks/useProduct";
import { generateOrderNumber } from "../../../utils/orderUtils";
import { BagIcon, EmptyCartIcon } from "../../elements/Icons";
import { CouponSection } from "../CouponSection";
import { PaymentSection } from "../PaymentSection";
import CartItemBox from "./CartItemBox";

interface CartSidebarProps {}

export const CartSidebar = ({}: CartSidebarProps) => {
  /** 장바구니 상태 - Jotai 사용 */
  const [cart, setCart] = useAtom(cartAtom);

  /** 선택된 쿠폰 - Jotai 사용 */
  const [selectedCoupon, setSelectedCoupon] = useAtom(selectedCouponAtom);

  /** 상품 데이터 - useProduct hook 사용 */
  const { products } = useProduct();

  /** 장바구니 관련 actions - useCart hook 사용 */
  const { calculateItemTotal } = useCart({ products });

  /** 장바구니 총액 계산 - 직접 hook 사용 */
  const totals = useCartTotals({ calculateItemTotal });

  /** 알림 표시 */
  const { showToast } = useNotification();

  /** 주문 완료 */
  const completeOrder = useCallback(() => {
    const orderNumber = generateOrderNumber();
    showToast(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, "success");
    setCart([]);
    setSelectedCoupon(null);
  }, [showToast, setCart, setSelectedCoupon]);

  return (
    <div className="sticky top-24 space-y-4">
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <BagIcon />
          장바구니
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <EmptyCartIcon />
            <p className="text-gray-500 text-sm">장바구니가 비어있습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <CartItemBox key={item.product.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {cart.length > 0 && (
        <>
          <CouponSection />
          <PaymentSection totals={totals} onCompleteOrder={completeOrder} />
        </>
      )}
    </div>
  );
};
