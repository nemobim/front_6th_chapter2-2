import { Provider } from "jotai";
import Header from "./components/layout/Header";
import { useCart } from "./hooks/useCart";
import { useCartTotals } from "./hooks/useCartTotals";
import { useCoupon } from "./hooks/useCoupon";
import { NotificationProvider } from "./hooks/useNotification";
import { useProduct } from "./hooks/useProduct";
import { useProductForm } from "./hooks/useProductForm";
import AdminPage from "./pages/AdminPage";
import { CustomerPage } from "./pages/CustomerPage";
import { useAtom } from "jotai";
import { isAdminAtom } from "./atoms/adminAtoms";

const AppContent = () => {
  /** 관리자 상태 여부 - Jotai 사용 */
  const [isAdmin] = useAtom(isAdminAtom);

  /** 상품 hook 사용 (AdminPage에서만 필요) */
  const { products, addProduct, updateProduct, deleteProduct } = useProduct();

  /** 상품 폼 hook 사용 (AdminPage에서만 필요) */
  const { editingProduct, setEditingProduct, showProductForm, setShowProductForm, productForm, setProductForm, editProductForm, clearProductForm } = useProductForm();

  /** 장바구니 hook 사용 (AdminPage에서만 필요) */
  const { getRemainingStock } = useCart({ products });

  /** 장바구니 총액 계산 (AdminPage의 쿠폰 관리용) */
  const cartTotals = useCartTotals({ calculateItemTotal: () => 0 }); // 임시

  /** 쿠폰 hook 사용 (AdminPage에서만 필요) */
  const { addCoupon, deleteCoupon } = useCoupon({ cartTotals });

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
          <CustomerPage />
        )}
      </main>
    </div>
  );
};

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
