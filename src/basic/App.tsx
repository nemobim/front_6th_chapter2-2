import { useState, useCallback } from "react";
import AdminNavigation from "./components/admin/AdminNavigation";
import CouponManager from "./components/admin/CouponManager";
import ProductManager from "./components/admin/ProductManager";
import Header from "./components/layout/Header";
import { TActiveTab } from "./constants/adminConstants";
import { useCart } from "./hooks/useCart";
import { useCoupon } from "./hooks/useCoupon";
import { NotificationProvider } from "./hooks/useNotification";
import { useProduct } from "./hooks/useProduct";
import { useSearch } from "./hooks/useSearch";
import { useProductForm } from "./hooks/useProductForm";
import { CustomerPage } from "./pages/CustomerPage";

// 메인 앱 컴포넌트 (NotificationProvider 내부에서 실행)
const AppContent = () => {
  /** 관리자 상태 여부 */
  const [isAdmin, setIsAdmin] = useState(false);

  /** 탭 상태 */
  const [activeTab, setActiveTab] = useState<TActiveTab>("products");

  /** 검색어 설정 */
  const { searchTerm, setSearchTerm, debouncedSearchTerm } = useSearch();

  /** 상품 hook 사용 */
  const { products, addProduct, updateProduct, deleteProduct } = useProduct();

  /** 상품 폼 hook 사용 */
  const { editingProduct, setEditingProduct, showProductForm, setShowProductForm, productForm, setProductForm, startEditProduct, resetProductForm } = useProductForm();

  /** 상품 등록 */
  const handleProductSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const isEditMode = editingProduct && editingProduct !== "new";
      if (isEditMode) {
        updateProduct(editingProduct, productForm);
      } else {
        addProduct(productForm);
      }

      resetProductForm();
    },
    [editingProduct, productForm, updateProduct, addProduct, resetProductForm]
  );

  /** 장바구니 hook 사용 */
  const { cart, setCart, addToCart, removeFromCart, updateQuantity, getRemainingStock, calculateItemTotal, totalItemCount, cartTotals, selectedCoupon, setSelectedCoupon } = useCart({ products });

  /** 쿠폰 hook 사용 */
  const { coupons, applyCoupon, completeOrder, addCoupon, deleteCoupon } = useCoupon({
    cartTotals,
    setCart,
    selectedCoupon,
    setSelectedCoupon,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsAdmin={setIsAdmin} totalItemCount={totalItemCount} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <div className="max-w-6xl mx-auto">
            {/* 관리자 대시보드 헤더 */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600 mt-1">상품과 쿠폰을 관리할 수 있습니다</p>
            </div>
            {/* 탭 네비게이션 */}
            <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* 상품 관리 */}
            {activeTab === "products" ? (
              <ProductManager
                products={products}
                isAdmin={isAdmin}
                activeTab={activeTab}
                handleProductSubmit={handleProductSubmit}
                productForm={productForm}
                editingProduct={editingProduct}
                showProductForm={showProductForm}
                setEditingProduct={setEditingProduct}
                setProductForm={setProductForm}
                setShowProductForm={setShowProductForm}
                startEditProduct={startEditProduct}
                deleteProduct={deleteProduct}
                getRemainingStock={getRemainingStock}
              />
            ) : (
              <CouponManager coupons={coupons} deleteCoupon={deleteCoupon} addCoupon={addCoupon} />
            )}
          </div>
        ) : (
          <CustomerPage
            isAdmin={isAdmin}
            products={products}
            cart={cart}
            debouncedSearchTerm={debouncedSearchTerm}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            getRemainingStock={getRemainingStock}
            calculateItemTotal={calculateItemTotal}
            totals={cartTotals}
            coupons={coupons}
            selectedCoupon={selectedCoupon}
            setSelectedCoupon={setSelectedCoupon}
            applyCoupon={applyCoupon}
            completeOrder={completeOrder}
          />
        )}
      </main>
    </div>
  );
};

// 루트 앱 컴포넌트 (Provider로 감싸기)
const App = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
