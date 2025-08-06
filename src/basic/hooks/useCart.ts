import { useState, useCallback, useEffect, useMemo } from "react";
import { CartItem } from "../../types";
import { ProductWithUI } from "../types/product";
import { useNotification } from "./useNotification";
import { calculateRemainingStock, calculateItemTotal, calculateTotalItemCount } from "../utils/cartCalculations";

interface UseCartProps {
  products: ProductWithUI[];
}

export const useCart = ({ products }: UseCartProps) => {
  const { showToast } = useNotification();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [totalItemCount, setTotalItemCount] = useState(0);

  /** 재고 계산 */
  const getRemainingStock = useCallback(
    (product: ProductWithUI): number => {
      return calculateRemainingStock(product, cart);
    },
    [cart]
  );

  /** 개별 상품 총액 계산 */
  const calculateItemTotalForCart = useCallback(
    (item: CartItem): number => {
      return calculateItemTotal(item, cart);
    },
    [cart]
  );

  /** 장바구니 관련 액션들 */
  const addToCart = useCallback(
    (product: ProductWithUI) => {
      const remainingStock = getRemainingStock(product);
      if (remainingStock <= 0) {
        showToast("재고가 부족합니다!", "error");
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;

          if (newQuantity > product.stock) {
            showToast(`재고는 ${product.stock}개까지만 있습니다.`, "error");
            return prevCart;
          }

          return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: newQuantity } : item));
        }

        return [...prevCart, { product, quantity: 1 }];
      });

      showToast("장바구니에 담았습니다", "success");
    },
    [getRemainingStock, showToast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const maxStock = product.stock;
      if (newQuantity > maxStock) {
        showToast(`재고는 ${maxStock}개까지만 있습니다.`, "error");
        return;
      }

      setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)));
    },
    [products, removeFromCart, showToast]
  );

  // 🧮 장바구니 아이템 카운트 계산
  useEffect(() => {
    const count = calculateTotalItemCount(cart);
    setTotalItemCount(count);
  }, [cart]);

  // localStorage 동기화
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  return {
    cart,
    setCart,
    totalItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    getRemainingStock,
    calculateItemTotal: calculateItemTotalForCart,
  };
};
