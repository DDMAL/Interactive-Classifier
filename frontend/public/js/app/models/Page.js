import BaseModel from "models/BaseModel";

export default BaseModel.extend({
    defaults: {
        id: 0,
        url: "",
        glyph_set: [],
        uuid: "",
        name: "",
        width: 0,
        height: 0
    }
});