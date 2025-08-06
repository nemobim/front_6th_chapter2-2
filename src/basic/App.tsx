import { useState, useCallback, useEffect } from "react";
import { CartItem, Coupon, Product } from "../types";
import { initialCoupons, initialProducts } from "./constants/data";
import { NewProductForm, ProductWithUI } from "./types/product";
import { Notification } from "./types";
import Header from "./components/layout/Header";
import Toast from "./components/elements/Toast";
import AdminNavigation from "./components/admin/AdminNavigation";
import ProductManagementTable from "./components/admin/ProductManager";
import CouponManagementTable from "./components/admin/CouponManager";
import ProductManager from "./components/admin/ProductManager";
import CouponManager from "./components/admin/CouponManager";

const App = () => {
  // 🔄 useProduct 훅으로 분리 가능한 상품 관련 상태
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  // 🛒 useCart 훅으로 분리 가능한 장바구니 관련 상태
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

  // 🎫 useCoupon 훅으로 분리 가능한 쿠폰 관련 상태
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem("coupons");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "coupons">("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Admin
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<NewProductForm>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    discounts: [] as Array<{ quantity: number; rate: number }>,
  });

  const [couponForm, setCouponForm] = useState({
    name: "",
    code: "",
    discountType: "amount" as "amount" | "percentage",
    discountValue: 0,
  });

  // 💲 가격 포맷팅 - formatPrice 유틸리티 함수로 분리
  const formatPrice = (price: number, productId?: string): string => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product && getRemainingStock(product) <= 0) {
        return "SOLD OUT";
      }
    }

    if (isAdmin) {
      return `${price.toLocaleString()}원`;
    }

    return `₩${price.toLocaleString()}`;
  };

  // 🏷️ 할인 계산 - calculateDiscount 유틸리티 함수로 분리
  const getMaxApplicableDiscount = (item: CartItem): number => {
    const { discounts } = item.product;
    const { quantity } = item;

    const baseDiscount = discounts.reduce((maxDiscount, discount) => {
      return quantity >= discount.quantity && discount.rate > maxDiscount ? discount.rate : maxDiscount;
    }, 0);

    const hasBulkPurchase = cart.some((cartItem) => cartItem.quantity >= 10);
    if (hasBulkPurchase) {
      return Math.min(baseDiscount + 0.05, 0.5); // 대량 구매 시 추가 5% 할인
    }

    return baseDiscount;
  };

  // 🧮 개별 상품 총액 계산 - calculateItemTotal 유틸리티 함수로 분리
  const calculateItemTotal = (item: CartItem): number => {
    const { price } = item.product;
    const { quantity } = item;
    const discount = getMaxApplicableDiscount(item);

    return Math.round(price * quantity * (1 - discount));
  };

  // 🧮 장바구니 총액 계산 - calculateCartTotal 유틸리티 함수로 분리
  const calculateCartTotal = (): {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
  } => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    cart.forEach((item) => {
      const itemPrice = item.product.price * item.quantity;
      totalBeforeDiscount += itemPrice;
      totalAfterDiscount += calculateItemTotal(item);
    });

    if (selectedCoupon) {
      if (selectedCoupon.discountType === "amount") {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount = Math.round(totalAfterDiscount * (1 - selectedCoupon.discountValue / 100));
      }
    }

    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount),
    };
  };

  // 📦 재고 계산 - getRemainingStock 유틸리티 함수로 분리
  const getRemainingStock = (product: Product): number => {
    const cartItem = cart.find((item) => item.product.id === product.id);
    const remaining = product.stock - (cartItem?.quantity || 0);

    return remaining;
  };

  // 🔔 알림 관리 - useNotification 훅으로 분리 가능
  const addNotification = useCallback((message: string, type: "error" | "success" | "warning" = "success") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const [totalItemCount, setTotalItemCount] = useState(0);

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  // 💾 localStorage 동기화 - useLocalStorage 훅으로 분리
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("coupons", JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  // 🔍 검색 디바운스 - useDebounce 훅으로 분리 가능
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================================================
  // 🛒 4. 장바구니 관련 액션들 - useCart 훅으로 분리 가능
  // ============================================================================

  const addToCart = useCallback(
    (product: ProductWithUI) => {
      const remainingStock = getRemainingStock(product);
      if (remainingStock <= 0) {
        addNotification("재고가 부족합니다!", "error");
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;

          if (newQuantity > product.stock) {
            addNotification(`재고는 ${product.stock}개까지만 있습니다.`, "error");
            return prevCart;
          }

          return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: newQuantity } : item));
        }

        return [...prevCart, { product, quantity: 1 }];
      });

      addNotification("장바구니에 담았습니다", "success");
    },
    [cart, addNotification, getRemainingStock]
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
        addNotification(`재고는 ${maxStock}개까지만 있습니다.`, "error");
        return;
      }

      setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)));
    },
    [products, removeFromCart, addNotification, getRemainingStock]
  );

  // ============================================================================
  // 🎫 5. 쿠폰 관련 액션들 - useCoupon 훅으로 분리 가능
  // ============================================================================

  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal().totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === "percentage") {
        addNotification("percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.", "error");
        return;
      }

      setSelectedCoupon(coupon);
      addNotification("쿠폰이 적용되었습니다.", "success");
    },
    [addNotification, calculateCartTotal]
  );

  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, "success");
    setCart([]);
    setSelectedCoupon(null);
  }, [addNotification]);

  // ============================================================================
  // 🎫 5. 쿠폰 관련 액션들 - useCoupon 훅으로 분리 가능
  // ============================================================================

  const addProduct = useCallback(
    (newProduct: Omit<ProductWithUI, "id">) => {
      const product: ProductWithUI = {
        ...newProduct,
        id: `p${Date.now()}`,
      };
      setProducts((prev) => [...prev, product]);
      addNotification("상품이 추가되었습니다.", "success");
    },
    [addNotification]
  );

  const updateProduct = useCallback(
    (productId: string, updates: Partial<ProductWithUI>) => {
      setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
      addNotification("상품이 수정되었습니다.", "success");
    },
    [addNotification]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addNotification("상품이 삭제되었습니다.", "success");
    },
    [addNotification]
  );

  const addCoupon = useCallback(
    (newCoupon: Coupon) => {
      const existingCoupon = coupons.find((c) => c.code === newCoupon.code);
      if (existingCoupon) {
        addNotification("이미 존재하는 쿠폰 코드입니다.", "error");
        return;
      }
      setCoupons((prev) => [...prev, newCoupon]);
      addNotification("쿠폰이 추가되었습니다.", "success");
    },
    [coupons, addNotification]
  );

  const deleteCoupon = useCallback(
    (couponCode: string) => {
      setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      if (selectedCoupon?.code === couponCode) {
        setSelectedCoupon(null);
      }
      addNotification("쿠폰이 삭제되었습니다.", "success");
    },
    [selectedCoupon, addNotification]
  );

  // ============================================================================
  // 📝 7. 폼 핸들러들 - 각각의 폼 컴포넌트로 분리 가능
  // ============================================================================

  // 📝 ProductForm 컴포넌트로 분리 가능
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct !== "new") {
      updateProduct(editingProduct, productForm);
      setEditingProduct(null);
    } else {
      addProduct({
        ...productForm,
        discounts: productForm.discounts,
      });
    }
    setProductForm({ name: "", price: 0, stock: 0, description: "", discounts: [] });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  // 📝 CouponForm 컴포넌트로 분리 가능
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

  const startEditProduct = (product: ProductWithUI) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
      discounts: product.discounts || [],
    });
    setShowProductForm(true);
  };

  // ============================================================================
  // 🧮 8. 계산된 값들
  // ============================================================================

  const totals = calculateCartTotal();

  const filteredProducts = debouncedSearchTerm
    ? products.filter(
        (product) => product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || (product.description && product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
    : products;

  // ============================================================================
  // 🎨 9. 렌더링 - 각각의 페이지/컴포넌트로 분리 가능
  // ============================================================================

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
