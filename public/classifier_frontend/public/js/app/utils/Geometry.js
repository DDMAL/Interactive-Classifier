export default {

    /**
     * Test if two rectangles overlap.
     *
     * @param rectangleA
     * @param rectangleB
     * @returns {boolean}
     */
    rectangleOverlap: function (rectangleA, rectangleB) {
        return rectangleA.left < rectangleB.right && rectangleA.right > rectangleB.left &&
            rectangleA.top < rectangleB.bottom && rectangleA.bottom > rectangleB.top;
    }
}