import { CartSidebar } from "../components/customer/cart/CartSidebar";
import { ProductGrid } from "../components/customer/product/ProductGrid";
import { useProductSearch } from "../hooks/useProductSearch";
import { useSearch } from "../hooks/useSearch";
import { ProductWithUI } from "../types/product";

interface CustomerPageProps {
  products: ProductWithUI[];
}

export const CustomerPage = ({ products }: CustomerPageProps) => {
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
