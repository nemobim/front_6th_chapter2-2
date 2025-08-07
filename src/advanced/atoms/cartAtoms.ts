import { atom } from "jotai";
import { CartItem } from "../../types";

export const cartAtom = atom<CartItem[]>([]);
export const totalItemCountAtom = atom<number>(0);
