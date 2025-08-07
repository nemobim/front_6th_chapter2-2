import { Dispatch, SetStateAction, useCallback } from "react";
import { CartItem } from "../../types";
import { CartSidebar } from "../components/customer/cart/CartSidebar";
import { ProductGrid } from "../components/customer/product/ProductGrid";
import { useNotification } from "../hooks/useNotification";
import { useProductSearch } from "../hooks/useProductSearch";
import { ProductWithUI } from "../types/product";
import { generateOrderNumber } from "../utils/orderUtils";
import { useAtom } from "jotai";
import { cartAtom } from "../atoms/cartAtoms";
import { selectedCouponAtom } from "../atoms/couponAtoms";
import { useSearch } from "../hooks/useSearch";

interface CustomerPageProps {
  products: ProductWithUI[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  addToCart: (product: ProductWithUI) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  getRemainingStock: (product: ProductWithUI) => number;
  calculateItemTotal: (item: CartItem) => number;
  applyCoupon: (coupon: any) => void;
  totals: { totalBeforeDiscount: number; totalAfterDiscount: number };
}

export const CustomerPage = ({ products, setCart, addToCart, removeFromCart, updateCartQuantity, getRemainingStock, calculateItemTotal, applyCoupon, totals }: CustomerPageProps) => {
  /** 검색어 설정 - Jotai 사용 */
  const { debouncedSearchTerm } = useSearch();

  /** 선택된 쿠폰 - Jotai 사용 */
  const [selectedCoupon, setSelectedCoupon] = useAtom(selectedCouponAtom);

  /** 알림 표시 */
  const { showToast } = useNotification();

  /** 상품 필터링 */
  const filteredProducts = useProductSearch({
    products,
    searchTerm: debouncedSearchTerm,
  });

  /** 주문 완료 */
  const completeOrder = useCallback(() => {
    const orderNumber = generateOrderNumber();
    showToast(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, "success");
    setCart([]);
    setSelectedCoupon(null);
  }, [showToast, setCart, setSelectedCoupon]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ProductGrid products={products} filteredProducts={filteredProducts} debouncedSearchTerm={debouncedSearchTerm} getRemainingStock={getRemainingStock} addToCart={addToCart} />
      </div>
      <div className="lg:col-span-1">
        <CartSidebar
          totals={totals}
          calculateItemTotal={calculateItemTotal}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          applyCoupon={applyCoupon}
          completeOrder={completeOrder}
        />
      </div>
    </div>
  );
};
