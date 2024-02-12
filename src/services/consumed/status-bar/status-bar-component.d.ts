import React from "react";
import type { Store } from "../../../store";
type Props = {
    store: Store;
    onClick: (...args: Array<any>) => any;
};
declare class StatusBar extends React.Component<Props> {
    render(): React.JSX.Element;
}
export default StatusBar;
