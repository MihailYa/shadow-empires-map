export function createSvgPathDataFromDots(dots) {
    if(dots.length === 0)
        throw Error('dots array should be greater then 0');
    let pathData = 'M ' + dots[0].x + ' ' + dots[0].y;
    for (let i = 1; i < dots.length; i++) {
        pathData += ' L ' + dots[i].x + ' ' + dots[i].y;
    }
    return pathData;
}

export function createSvgAreaPathDataFromDots(dots) {
    return createSvgPathDataFromDots(dots) + ' z';
}