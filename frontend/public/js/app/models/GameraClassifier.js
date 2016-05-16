import BaseModel from "models/BaseModel";

export default BaseModel.extend({
    default: {
        name: "",
        id: 0,
        owner: undefined,
        page_set: []
    }
});