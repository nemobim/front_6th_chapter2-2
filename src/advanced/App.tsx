import { Provider } from "jotai";
import Header from "./components/layout/Header";
import { useCart } from "./hooks/useCart";
import { useCoupon } from "./hooks/useCoupon";
import { NotificationProvider } from "./hooks/useNotification";
import { useProduct } from "./hooks/useProduct";
import { useProductForm } from "./hooks/useProductForm";
import AdminPage from "./pages/AdminPage";
import { CustomerPage } from "./pages/CustomerPage";
import { useAtom } from "jotai";
import { isAdminAtom } from "./atoms/adminAtoms";
import { cartTotalsAtom } from "./atoms/cartAtoms";

// 메인 앱 컴포넌트 (NotificationProvider 내부에서 실행)
const AppContent = () => {
  /** 관리자 상태 여부 - Jotai 사용 */
  const [isAdmin] = useAtom(isAdminAtom);

  /** 상품 hook 사용 */
  const { products, addProduct, updateProduct, deleteProduct } = useProduct();

  /** 상품 폼 hook 사용 */
  const { editingProduct, setEditingProduct, showProductForm, setShowProductForm, productForm, setProductForm, editProductForm, clearProductForm } = useProductForm();

  /** 장바구니 hook 사용 */
  const { cart, setCart, addToCart, removeFromCart, updateCartQuantity, getRemainingStock, calculateItemTotal } = useCart({ products });

  /** 장바구니 총액 - Jotai 사용 */
  const [cartTotals] = useAtom(cartTotalsAtom);

  /** 쿠폰 hook 사용 */
  const { applyCoupon, addCoupon, deleteCoupon } = useCoupon({ cartTotals });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            clearProductForm={clearProductForm}
            productForm={productForm}
            editingProduct={editingProduct}
            showProductForm={showProductForm}
            setEditingProduct={setEditingProduct}
            setProductForm={setProductForm}
            setShowProductForm={setShowProductForm}
            editProductForm={editProductForm}
            deleteProduct={deleteProduct}
            getRemainingStock={getRemainingStock}
            deleteCoupon={deleteCoupon}
            addCoupon={addCoupon}
          />
        ) : (
          <CustomerPage
            products={products}
            setCart={setCart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            getRemainingStock={getRemainingStock}
            calculateItemTotal={calculateItemTotal}
            applyCoupon={applyCoupon}
          />
        )}
      </main>
    </div>
  );
};

// 루트 앱 컴포넌트 (Provider로 감싸기)
const App = () => {
  return (
    <Provider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Provider>
  );
};

export default App;
