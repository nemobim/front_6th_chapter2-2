import { useState, useCallback, useEffect } from "react";
import { NewProductForm, ProductWithUI } from "../types/product";
import { initialProducts } from "../constants/data";
import { useNotification } from "./useNotification";
import { generateProductId, INITIAL_PRODUCT_FORM } from "../utils/productUtils";
import { loadDataFromStorage } from "../utils/localStorageUtils";

export const useProduct = () => {
  /** 알림 표시 */
  const { showToast } = useNotification();

  /** 상품 현황 */
  const [products, setProducts] = useState<ProductWithUI[]>(loadDataFromStorage<ProductWithUI[]>("products", initialProducts));

  /** 상품 관리 편집 */
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  /** 상품 폼 표시 상태 */
  const [showProductForm, setShowProductForm] = useState(false);

  /** 상품 폼 데이터 */
  const [productForm, setProductForm] = useState<NewProductForm>(INITIAL_PRODUCT_FORM);

  /** 상품 추가 */
  const addProduct = useCallback(
    (newProduct: Omit<ProductWithUI, "id">) => {
      setProducts((prev) => [...prev, { ...newProduct, id: generateProductId() }]);
      showToast("상품이 추가되었습니다.", "success");
    },
    [showToast]
  );

  /** 상품 정보 수정 */
  const updateProduct = useCallback(
    (productId: string, updates: Partial<ProductWithUI>) => {
      setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
      showToast("상품이 수정되었습니다.", "success");
    },
    [showToast]
  );

  /** 상품 삭제 */
  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast("상품이 삭제되었습니다.", "success");
    },
    [showToast]
  );

  /** 상품 수정시 폼 초기값 설정 */
  const startEditProduct = useCallback((product: ProductWithUI) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
      discounts: product.discounts || [],
    });
    setShowProductForm(true);
  }, []);

  /** 상품 폼 초기화 */
  const resetProductForm = useCallback(() => {
    setProductForm(INITIAL_PRODUCT_FORM);
    setEditingProduct(null);
    setShowProductForm(false);
  }, []);

  /** 상품 등록 */
  const handleProductSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      //수정 여부 확인
      const isEditMode = editingProduct && editingProduct !== "new";
      if (isEditMode) {
        updateProduct(editingProduct, productForm);
      } else {
        addProduct(productForm);
      }

      //폼 초기화
      resetProductForm();
    },
    [editingProduct, productForm, updateProduct, addProduct, resetProductForm]
  );

  /** localStorage 동기화 */
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  return {
    products,
    editingProduct,
    setEditingProduct,
    showProductForm,
    setShowProductForm,
    productForm,
    setProductForm,
    addProduct,
    updateProduct,
    deleteProduct,
    startEditProduct,
    handleProductSubmit,
  };
};
