import { ProductWithUI } from "../types/product";

interface IStockChecker {
  productId: string;
  products: ProductWithUI[];
  getRemainingStock: (product: ProductWithUI) => number;
}

/** 품절 상태 확인 */
const checkSoldOut = ({ productId, products, getRemainingStock }: IStockChecker): boolean => {
  const product = products.find((p) => p.id === productId);
  return product ? getRemainingStock(product) <= 0 : false;
};

/** 가격을 포맷팅하는 함수 */
const formatCurrency = (price: number, isAdmin: boolean): string => {
  const formattedPrice = price.toLocaleString();
  return isAdmin ? `${formattedPrice}원` : `₩${formattedPrice}`;
};

/** 가격 포맷팅 */
export const formatPrice = (price: number, isAdmin: boolean, stockChecker?: IStockChecker): string => {
  // 품절 표시
  if (stockChecker && checkSoldOut(stockChecker)) {
    return "SOLD OUT";
  }

  // 가격 포맷팅
  return formatCurrency(price, isAdmin);
};

/** 새로운 상품 ID를 생성 */
export const generateProductId = (): string => {
  const timestamp = Date.now();
  return `p${timestamp}`;
};

/** 상품 생성 초기값 */
export const INITIAL_PRODUCT_FORM = { name: "", price: 0, stock: 0, description: "", discounts: [] as Array<{ quantity: number; rate: number }> };
