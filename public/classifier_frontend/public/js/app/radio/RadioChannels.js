import Radio from "backbone.radio";


export default {
    modal: Radio.channel("modal"),
    globalUI: Radio.channel("globalUI"),
    edit: Radio.channel("edit"),
    menu: Radio.channel("menu")
}