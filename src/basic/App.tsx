import { useState } from "react";
import AdminNavigation from "./components/admin/AdminNavigation";
import CouponManager from "./components/admin/CouponManager";
import ProductManager from "./components/admin/ProductManager";
import Toast from "./components/elements/Toast";
import Header from "./components/layout/Header";
import { useCart } from "./hooks/useCart";
import { useCoupon } from "./hooks/useCoupon";
import { useDebounce } from "./hooks/useDebounce";
import { useNotification } from "./hooks/useNotification";
import { useProduct } from "./hooks/useProduct";
import { useCartTotal } from "./hooks/useCartTotal";
import { useProductFilter } from "./hooks/useProductFilter";
import { useAdmin } from "./hooks/useAdmin";
import { useCouponForm } from "./hooks/useCouponForm";
import { CustomerPage } from "./pages/CustomerPage";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔔 알림 관리 훅 사용
  const { notifications, setNotifications, addNotification } = useNotification();

  // 🔍 검색 디바운스 훅 사용
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 👨‍💼 관리자 상태 훅 사용
  const { isAdmin, setIsAdmin, activeTab, setActiveTab } = useAdmin();

  // 🎫 쿠폰 폼 훅 사용
  const { showCouponForm, setShowCouponForm, couponForm, setCouponForm, resetCouponForm } = useCouponForm();

  // 🛍️ 상품 훅 사용
  const { products, editingProduct, setEditingProduct, showProductForm, setShowProductForm, productForm, setProductForm, deleteProduct, startEditProduct, handleProductSubmit, formatPrice } =
    useProduct({ addNotification, isAdmin });

  // 🛒 장바구니 훅 사용
  const { cart, setCart, addToCart, removeFromCart, updateQuantity, getRemainingStock, calculateItemTotal, totalItemCount } = useCart({ products, addNotification });

  // 🧮 장바구니 총액 계산 훅 사용
  const calculateCartTotal = () => {
    const totalBeforeDiscount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalAfterDiscount = cart.reduce((sum, item) => sum + item.product.price * item.quantity * (1 - item.product.discounts[0]?.rate || 0), 0);
    return { totalBeforeDiscount, totalAfterDiscount };
  };

  // 🎫 쿠폰 훅 사용
  const { coupons, selectedCoupon, setSelectedCoupon, applyCoupon, completeOrder, addCoupon, deleteCoupon } = useCoupon({
    addNotification,
    calculateCartTotal,
    setCart,
  });

  // 🧮 장바구니 총액 계산 훅 사용
  const totals = useCartTotal({ cart, selectedCoupon, calculateItemTotal });

  // 🔍 상품 필터링 훅 사용
  const filteredProducts = useProductFilter({ products, searchTerm: debouncedSearchTerm });

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCoupon(couponForm);
    resetCouponForm();
    setShowCouponForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast notifications={notifications} setNotifications={setNotifications} />
      <Header isAdmin={isAdmin} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsAdmin={setIsAdmin} cart={cart} totalItemCount={totalItemCount} />
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
                activeTab={activeTab}
                handleProductSubmit={handleProductSubmit}
                productForm={productForm}
                editingProduct={editingProduct}
                showProductForm={showProductForm}
                setEditingProduct={setEditingProduct}
                setProductForm={setProductForm}
                setShowProductForm={setShowProductForm}
                formatPrice={formatPrice}
                startEditProduct={startEditProduct}
                deleteProduct={deleteProduct}
                addNotification={addNotification}
              />
            ) : (
              <CouponManager
                coupons={coupons}
                showCouponForm={showCouponForm}
                setShowCouponForm={setShowCouponForm}
                couponForm={couponForm}
                setCouponForm={setCouponForm}
                handleCouponSubmit={handleCouponSubmit}
                deleteCoupon={deleteCoupon}
                addNotification={addNotification}
              />
            )}
          </div>
        ) : (
          <CustomerPage
            products={products}
            cart={cart}
            filteredProducts={filteredProducts}
            debouncedSearchTerm={debouncedSearchTerm}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            getRemainingStock={getRemainingStock}
            formatPrice={formatPrice}
            calculateItemTotal={calculateItemTotal}
            coupons={coupons}
            selectedCoupon={selectedCoupon}
            applyCoupon={applyCoupon}
            setSelectedCoupon={setSelectedCoupon}
            completeOrder={completeOrder}
            totals={totals}
          />
        )}
      </main>
    </div>
  );
};

export default App;
