import { useState, useCallback, useEffect } from "react";
import { NewProductForm, ProductWithUI } from "../types/product";
import { initialProducts } from "../constants/data";
import { useNotification } from "./useNotification";

interface UseProductProps {
  isAdmin: boolean;
}

export const useProduct = ({ isAdmin }: UseProductProps) => {
  const { addNotification } = useNotification();
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

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState<NewProductForm>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    discounts: [] as Array<{ quantity: number; rate: number }>,
  });

  // ️ 상품 관련 액션들
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

  // 💲 가격 포맷팅
  const formatPrice = (price: number, productId?: string, getRemainingStock?: (product: ProductWithUI) => number): string => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product && getRemainingStock && getRemainingStock(product) <= 0) {
        return "SOLD OUT";
      }
    }

    if (isAdmin) {
      return `${price.toLocaleString()}원`;
    }

    return `₩${price.toLocaleString()}`;
  };

  // localStorage 동기화
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
    formatPrice,
  };
};
