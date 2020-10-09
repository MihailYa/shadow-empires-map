import useImage from "use-image";
import {Image} from "react-konva";
import React from "react";

export const MapImage = () => {
    const [image] = useImage('img/map.jpg');
    return <Image image={image} />;
};