import { atom } from "jotai";
import { ProductWithUI } from "../types/product";

export const productsAtom = atom<ProductWithUI[]>([]);
export const productFormAtom = atom<any>({});
export const editingProductAtom = atom<string | null>(null);
export const showProductFormAtom = atom<boolean>(false);
