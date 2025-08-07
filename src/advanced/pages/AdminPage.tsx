import { Dispatch, SetStateAction, useState } from "react";
import AdminNavigation from "../components/admin/AdminNavigation";
import CouponManager from "../components/admin/coupon/CouponManager";
import ProductManager from "../components/admin/product/ProductManager";
import { TActiveTab } from "../constants/adminConstants";
import { NewProductForm, ProductWithUI } from "../types/product";

interface AdminDashboardProps {
  // 상품 관련
  products: ProductWithUI[];
  addProduct: (product: NewProductForm) => void;
  updateProduct: (productId: string, product: NewProductForm) => void;
  clearProductForm: () => void;
  productForm: NewProductForm;
  editingProduct: string | null;
  showProductForm: boolean;
  setEditingProduct: Dispatch<SetStateAction<string | null>>;
  setProductForm: Dispatch<SetStateAction<NewProductForm>>;
  setShowProductForm: Dispatch<SetStateAction<boolean>>;
  editProductForm: (product: ProductWithUI) => void;
  deleteProduct: (productId: string) => void;
  getRemainingStock: (product: ProductWithUI) => number;
}

const AdminPage = ({
  products,
  addProduct,
  updateProduct,
  clearProductForm,
  productForm,
  editingProduct,
  showProductForm,
  setEditingProduct,
  setProductForm,
  setShowProductForm,
  editProductForm,
  deleteProduct,
  getRemainingStock,
}: AdminDashboardProps) => {
  /** 탭 상태 */
  const [activeTab, setActiveTab] = useState<TActiveTab>("products");

  return (
    <div className="max-w-6xl mx-auto">
      {/* 관리자 대시보드 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-1">상품과 쿠폰을 관리할 수 있습니다</p>
      </div>

      {/* 탭 네비게이션 */}
      <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 탭 컨텐츠 */}
      {activeTab === "products" ? (
        <ProductManager
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
        />
      ) : (
        <CouponManager />
      )}
    </div>
  );
};

export default AdminPage;
