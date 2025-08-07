import { atom } from "jotai";

/** 관리자 여부 */
export const isAdminAtom = atom<boolean>(false);

/** 활성화된 탭 */
export const activeTabAtom = atom<string>("products");
