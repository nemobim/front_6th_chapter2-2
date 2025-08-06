import { useMemo } from "react";
import { ProductWithUI } from "../types/product";

interface UseProductFilterProps {
  products: ProductWithUI[];
  searchTerm: string;
}

export const useProductFilter = ({ products, searchTerm }: UseProductFilterProps) => {
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;

    return products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [products, searchTerm]);

  return filteredProducts;
};
