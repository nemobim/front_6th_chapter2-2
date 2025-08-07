import { CartSidebar } from "../components/customer/cart/CartSidebar";
import { ProductGrid } from "../components/customer/product/ProductGrid";
import { useProduct } from "../hooks/useProduct";
import { useProductSearch } from "../hooks/useProductSearch";
import { useSearch } from "../hooks/useSearch";

export const CustomerPage = () => {
  /** 상품 데이터 - useProduct hook 사용 */
  const { products } = useProduct();

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
        <ProductGrid products={products} filteredProducts={filteredProducts} debouncedSearchTerm={debouncedSearchTerm} />
      </div>
      <div className="lg:col-span-1">
        <CartSidebar />
      </div>
    </div>
  );
};
