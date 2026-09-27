import { createContext } from "react";

export type BreadcrumbType = "text" | "text-line" | "button";

export const BreadcrumbsContext = createContext<{ divider: "chevron" | "slash"; type: BreadcrumbType }>({
    divider: "chevron",
    type: "text",
});
