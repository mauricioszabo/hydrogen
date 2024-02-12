import React from "react";
type store = typeof import("../../store").default;
declare const Watches: ({ store: { kernel } }: {
    store: store;
}) => React.JSX.Element;
export default Watches;
