export function deleteDot(dotsList, regionsList, dotIndex) {
    dotsList.splice(dotIndex, 1);
    // noinspection DuplicatedCode
    for (let i = 0; i < regionsList.length; i++) {
        const index = regionsList[i].dotsIndices.findIndex(value => value === dotIndex);
        if(index !== -1) {
            regionsList[i].dotsIndices.splice(index, 1);
        }
        regionsList[i].dotsIndices = regionsList[i].dotsIndices.map(curDotIndex => {
            if(curDotIndex > dotIndex)
                return curDotIndex - 1;
            else
                return curDotIndex;
        });
    }

    return {
        dotsList: dotsList,
        regionsList: regionsList
    }
}