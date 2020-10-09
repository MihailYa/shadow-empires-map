import React from "react";

export class KonvaStyling {
    constructor(styles) {
        this.styles = styles;
    }

    stylizeElement(element) {
        if (!element)
            return false;
        const elementStyle = this.getStyle(element.props.className);
        return this.applyStyle(element, elementStyle);
    }

    getStyle(className) {
        if (!className) return {};
        return className.split(' ').reduce((style, className) => {
            return {...style, ...this.styles[className]};
        }, {});
    }

    applyStyle(element, style) {
        if (!element)
            return false;
        if (element.key)
            return React.createElement(element.type, {...{...element.props, ...style}, key: element.key});
        else
            return React.createElement(element.type, {...{...element.props, ...style}});
    }

    applyPathStyle(element, style) {

    }
}