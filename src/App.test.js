import {deleteDot} from "./components/map/utils/regionsUtils";

it("deleteDot1", () => {
    const result = deleteDot([0, 1, 2, 3], [{dotsIndices: [0, 1, 2, 3]}], 1);
    expect(result.dotsList).toStrictEqual([0, 2, 3]);
    expect(result.regionsList).toStrictEqual([{dotsIndices: [0, 1, 2]}]);
});

it("deleteDot2", () => {
    const result = deleteDot([0, 1, 2], [{dotsIndices: [0, 1, 2]}], 1);
    expect(result.dotsList).toStrictEqual([0, 2]);
    expect(result.regionsList).toStrictEqual([{dotsIndices: [0, 1]}]);
});
