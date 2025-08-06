import { useEffect, useState } from "react";
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

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "coupons">("products");
  const [searchTerm, setSearchTerm] = useState("");

  const [couponForm, setCouponForm] = useState({
    name: "",
    code: "",
    discountType: "amount" as "amount" | "percentage",
    discountValue: 0,
  });

  // 🔔 알림 관리 훅 사용
  const { notifications, setNotifications, addNotification } = useNotification();

  // 🔍 검색 디바운스 훅 사용
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 🛍️ 상품 훅 사용
  const { products, editingProduct, setEditingProduct, showProductForm, setShowProductForm, productForm, setProductForm, deleteProduct, startEditProduct, handleProductSubmit, formatPrice } =
    useProduct({ addNotification, isAdmin });

  // 🛒 장바구니 훅 사용
  const { cart, setCart, addToCart, removeFromCart, updateQuantity, getRemainingStock, calculateItemTotal } = useCart({ products, addNotification });

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

  const [totalItemCount, setTotalItemCount] = useState(0);

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCoupon(couponForm);
    setCouponForm({
      name: "",
      code: "",
      discountType: "amount",
      discountValue: 0,
    });
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 🛒 고객 페이지 - CustomerPage 컴포넌트로 분리 가능 */}
            <div className="lg:col-span-3">
              {/* 📊 상품 목록 헤더 - ProductListHeader 컴포넌트로 분리 */}
              <section>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">전체 상품</h2>
                  <div className="text-sm text-gray-600">총 {products.length}개 상품</div>
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">"{debouncedSearchTerm}"에 대한 검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 🔍 검색 결과 또는 상품 그리드 */}
                    {filteredProducts.map((product) => {
                      const remainingStock = getRemainingStock(product);

                      return (
                        <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                          {/* 상품 이미지 영역 (placeholder) */}
                          <div className="relative">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            {product.isRecommended && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">BEST</span>}
                            {product.discounts.length > 0 && (
                              <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">~{Math.max(...product.discounts.map((d) => d.rate)) * 100}%</span>
                            )}
                          </div>

                          {/* 상품 정보 */}
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            {product.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>}

                            {/* 가격 정보 */}
                            <div className="mb-3">
                              <p className="text-lg font-bold text-gray-900">{formatPrice(product.price, product.id)}</p>
                              {product.discounts.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  {product.discounts[0].quantity}개 이상 구매시 할인 {product.discounts[0].rate * 100}%
                                </p>
                              )}
                            </div>

                            {/* 재고 상태 */}
                            <div className="mb-3">
                              {remainingStock <= 5 && remainingStock > 0 && <p className="text-xs text-red-600 font-medium">품절임박! {remainingStock}개 남음</p>}
                              {remainingStock > 5 && <p className="text-xs text-gray-500">재고 {remainingStock}개</p>}
                            </div>

                            {/* 장바구니 버튼 */}
                            <button
                              onClick={() => addToCart(product)}
                              disabled={remainingStock <= 0}
                              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                remainingStock <= 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"
                              }`}
                            >
                              {remainingStock <= 0 ? "품절" : "장바구니 담기"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
            {/* 🛒 사이드바 영역 - CartSidebar 컴포넌트로 분리 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* 🛒 장바구니 섹션 - CartSection 컴포넌트로 분리  */}
                <section className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    장바구니
                  </h2>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      {/* 📭 빈 장바구니 - EmptyCart 컴포넌트로 분리 */}
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="text-gray-500 text-sm">장바구니가 비어있습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => {
                        const itemTotal = calculateItemTotal(item);
                        const originalPrice = item.product.price * item.quantity;
                        const hasDiscount = itemTotal < originalPrice;
                        const discountRate = hasDiscount ? Math.round((1 - itemTotal / originalPrice) * 100) : 0;

                        return (
                          <div key={item.product.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-medium text-gray-900 flex-1">{item.product.name}</h4>
                              <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 ml-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                >
                                  <span className="text-xs">−</span>
                                </button>
                                <span className="mx-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                >
                                  <span className="text-xs">+</span>
                                </button>
                              </div>
                              <div className="text-right">
                                {hasDiscount && <span className="text-xs text-red-500 font-medium block">-{discountRate}%</span>}
                                <p className="text-sm font-medium text-gray-900">{Math.round(itemTotal).toLocaleString()}원</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {cart.length > 0 && (
                  <>
                    {/* 🎫 쿠폰 섹션 - CouponSection 컴포넌트로 분리 */}
                    <section className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">쿠폰 할인</h3>
                        <button className="text-xs text-blue-600 hover:underline">쿠폰 등록</button>
                      </div>
                      {coupons.length > 0 && (
                        <select
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                          value={selectedCoupon?.code || ""}
                          onChange={(e) => {
                            const coupon = coupons.find((c) => c.code === e.target.value);
                            if (coupon) applyCoupon(coupon);
                            else setSelectedCoupon(null);
                          }}
                        >
                          <option value="">쿠폰 선택</option>
                          {coupons.map((coupon) => (
                            <option key={coupon.code} value={coupon.code}>
                              {coupon.name} ({coupon.discountType === "amount" ? `${coupon.discountValue.toLocaleString()}원` : `${coupon.discountValue}%`})
                            </option>
                          ))}
                        </select>
                      )}
                    </section>

                    {/* 💳 결제 정보 섹션 - PaymentSection 컴포넌트로 분리 */}
                    <section className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold mb-4">결제 정보</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">상품 금액</span>
                          <span className="font-medium">{totals.totalBeforeDiscount.toLocaleString()}원</span>
                        </div>
                        {totals.totalBeforeDiscount - totals.totalAfterDiscount > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>할인 금액</span>
                            <span>-{(totals.totalBeforeDiscount - totals.totalAfterDiscount).toLocaleString()}원</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-t border-gray-200">
                          <span className="font-semibold">결제 예정 금액</span>
                          <span className="font-bold text-lg text-gray-900">{totals.totalAfterDiscount.toLocaleString()}원</span>
                        </div>
                      </div>

                      {/* 💳 결제 버튼 - CheckoutButton 컴포넌트로 분리 */}
                      <button onClick={completeOrder} className="w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-md font-medium hover:bg-yellow-500 transition-colors">
                        {totals.totalAfterDiscount.toLocaleString()}원 결제하기
                      </button>

                      <div className="mt-3 text-xs text-gray-500 text-center">
                        <p>* 실제 결제는 이루어지지 않습니다</p>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
