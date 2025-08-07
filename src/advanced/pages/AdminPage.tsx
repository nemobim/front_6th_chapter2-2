import { useState } from "react";
import AdminNavigation from "../components/admin/AdminNavigation";
import CouponManager from "../components/admin/coupon/CouponManager";
import ProductManager from "../components/admin/product/ProductManager";
import { TActiveTab } from "../constants/adminConstants";

const AdminPage = () => {
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
      {activeTab === "products" ? <ProductManager /> : <CouponManager />}
    </div>
  );
};

export default AdminPage;
