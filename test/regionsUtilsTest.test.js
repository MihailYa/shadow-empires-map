import {deleteDot} from "../src/components/map/utils/regionsUtils";

it("deleteDot1", () => {
    const result = deleteDot([0, 1, 2], [{dotsIndices: [0, 1, 2]}], 1);
    expect(result.dotsList).toBe([0, 2]);
    expect(result.regionsList).toBe([{dotsIndices: [0, 1]}]);
});