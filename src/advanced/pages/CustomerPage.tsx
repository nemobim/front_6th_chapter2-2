import { CartItem } from "../../types";
import { CartSidebar } from "../components/customer/cart/CartSidebar";
import { ProductGrid } from "../components/customer/product/ProductGrid";
import { useProductSearch } from "../hooks/useProductSearch";
import { useSearch } from "../hooks/useSearch";
import { ProductWithUI } from "../types/product";

interface CustomerPageProps {
  products: ProductWithUI[];
  addToCart: (product: ProductWithUI) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  getRemainingStock: (product: ProductWithUI) => number;
  calculateItemTotal: (item: CartItem) => number;
}

export const CustomerPage = ({ products, addToCart, removeFromCart, updateCartQuantity, getRemainingStock, calculateItemTotal }: CustomerPageProps) => {
  /** 검색어 설정 - Jotai 사용 */
  const { debouncedSearchTerm } = useSearch();

  /** 상품 필터링 */
  const filteredProducts = useProductSearch({
    products,
    searchTerm: debouncedSearchTerm,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ProductGrid products={products} filteredProducts={filteredProducts} debouncedSearchTerm={debouncedSearchTerm} getRemainingStock={getRemainingStock} addToCart={addToCart} />
      </div>
      <div className="lg:col-span-1">
        <CartSidebar calculateItemTotal={calculateItemTotal} removeFromCart={removeFromCart} updateCartQuantity={updateCartQuantity} />
      </div>
    </div>
  );
};
