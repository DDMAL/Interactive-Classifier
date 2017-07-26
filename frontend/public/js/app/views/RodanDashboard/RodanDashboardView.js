import _ from "underscore";
import Backbone from "backbone";
import Marionette from "marionette";
import ClassEvents from "events/ClassEvents";
import GlyphEvents from "events/GlyphEvents";
import PageEvents from "events/PageEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import ClassEditView from "views/ClassEdit/ClassEditView";
import GlyphMultiEditView from "views/GlyphMultiEdit/GlyphMultiEditView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";
import ImagePreviewView from "views/ImagePreview/ImagePreviewView";
import ImagePreviewViewModel from "views/ImagePreview/ImagePreviewViewModel";
import RadioChannels from "radio/RadioChannels";
import Strings from "localization/Strings";
import Timer from "utils/Timer";
import template from "./rodan-dashboard.template.html";
import each from "underscore";

export default Marionette.LayoutView.extend(
    /**
     * @lends RodanDashboardView.prototype
     */
    {
        template,

        regions: {
            classCreateRegion: ".glyph-class-create-region",
            glyphTreeRegion: ".glyph-class-tree-region",
            glyphTableRegion: ".glyph-table-region",
            glyphEditRegion: ".glyph-edit-region",
            pagePreviewRegion: ".page-image-preview-region",
            modalTestRegion: ".modal-test"
        },

        /**
         * @class RodanDashboardView
         *
         * This view is the main "dashboard" of the application.  This view handles
         * most of the glyph editing functionality and determines which editing
         * views the user can see.
         *
         * @constructs
         */
        initialize: function ()
        {
            // Create the preview window
            this.previewView = new ImagePreviewView({
                model: new ImagePreviewViewModel({
                    backgroundImage: this.model.get("binaryImage")
                })
            });

            // Construct the glyph table data structure
            this.tableRowCollection = new GlyphTableRowCollection();      

            // Selected Glyphs
            this.selectedGlyphs = new Backbone.Collection();
            var that = this;
            this.listenTo(RadioChannels.edit, GlyphEvents.selectGlyph,
                function (glyph)
                {
                    that.selectedGlyphs.add(glyph);
                }
            );
            this.listenTo(RadioChannels.edit, GlyphEvents.deselectGlyph,
                function (glyph)
                {
                    that.selectedGlyphs.remove(glyph);
                }
            );
            this.listenTo(RadioChannels.edit, GlyphEvents.deselectAllGlyphs,
                function ()
                {
                    that.selectedGlyphs.reset();
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.addGlyph,
                function (glyph, className)
                {
                    that.tableRowCollection.addGlyph(glyph, className);
                }
            );            
            // Class editing events
            this.listenTo(RadioChannels.edit, ClassEvents.openClassEdit,
                function (className)
                {
                    that.openClassEdit(className);
                });

            this.listenTo(RadioChannels.edit, ClassEvents.deleteClass,
                function(className)
                {
                    var classes = this.model.get('classNames');
                    that.tableRowCollection.deleteClass(name);
                    for(var i = 0; i < classes.length; i++)
                    {
                        var name = classes[i];
                        if(name.startsWith(className + "."))
                        {
                            that.tableRowCollection.deleteClass(name);
                        }
                    }

                });

            // Glyph Editing Events
            this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit,
                function (model)
                {
                    that.previewView.highlightGlyph([model]);
                    that.openGlyphEdit(model);
                });
            this.listenTo(RadioChannels.edit, GlyphEvents.moveGlyph,
                function (glyph, oldClassName, newClassName)
                {
                    that.tableRowCollection.moveGlyph(glyph, oldClassName, newClassName);
                }
            );

            this.listenTo(RadioChannels.edit, PageEvents.zoom,
            function (zoomLevel)
                {
                    var pic = document.getElementsByClassName("preview-background")[0];
                    var oldHeight = pic.style.originalHeight;
                    var newHeight = oldHeight*zoomLevel/50; //50 is the default value
                    pic.style.height = newHeight + "px";
                    //makes sure the box around the glyphs follows the zoom
                    RadioChannels.edit.trigger(GlyphEvents.openMultiEdit);
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.openMultiEdit,
                function ()
                {
                    that.openMultiGlyphEdit(that.selectedGlyphs);                    
                    var glyphs = [];

                    for(var i = 0; i < that.selectedGlyphs.length; i++)
                    {
                        var glyph = that.selectedGlyphs.at(i);
                        glyphs.push(glyph);
                    }
                    that.previewView.highlightGlyph(glyphs);
                }
            );

        },

        onShow: function ()
        {
            var timer = new Timer("RodanDashboardView onShow");

            // Create the preview
            this.pagePreviewRegion.show(this.previewView);

            timer.tick();

            var glyphDictionary = this.model.get("glyphDictionary");
            var classNames = this.model.get("classNames");

            // Show the tree
            this.glyphTreeRegion.show(new ClassTreeView({
                model: new ClassTreeViewModel({
                    class_names: classNames
                })
            }));


            timer.tick();

            var glyphCollections = {};
            // Separate the glyphs by their class

             for (var i = 0; i < classNames.length; i++)
            {
                glyphCollections[classNames[i]] = new GlyphCollection(glyphDictionary[classNames[i]]);
            }


            timer.tick("pre-final render");

            var that = this;
            _.each(classNames, function (className)
            {
                var row = new GlyphTableRowViewModel({
                    class_name: className,
                    glyphs: glyphCollections[className]
                });
                that.tableRowCollection.add(row);
            });

            timer.tick();

            this.glyphTableRegion.show(new GlyphTableView({
                collection: this.tableRowCollection
            }));


            // This section deals with resizing.

            /* TODO: the decimals here are harcoded (they are the original percentages for height/width)
             * These values should be found through the document somehow.
             * These values are all the original values for the heights/widths of certain elements
             */
            this.classHeight = document.getElementById("left1").getClientRects()[0].height / 0.5;
            this.classWidth = document.getElementById("left1").getClientRects()[0].width / 0.25;
            this.glyphHeight = document.getElementById("right1").getClientRects()[0].height / 0.66;
            this.winWidth = window.innerWidth;
            this.winHeight = window.innerHeight;

            var that = this;

            $(document).mousemove(function (event)
            {
                // Each region of the table
                var glyphEdit = document.getElementById("left2");
                var glyphTable = document.getElementById("right1");
                var imgPrev = document.getElementById("right2");
                var classEdit = document.getElementById("left1");

                var currentHeight = classEdit.getClientRects()[0].height;
                var currentWidth = classEdit.getClientRects()[0].width;

                var currentWinHeight = window.innerHeight;
                var currentWinWidth = window.innerWidth;

                // If the window has been resized, the original widths/heights must be modified
                if(that.winWidth != currentWinWidth)
                {
                    var perc = that.winWidth/currentWinWidth;                    
                    that.winWidth = currentWinWidth;
                    that.classWidth = that.classWidth/perc; 
                }

                if(that.winHeight != currentWinHeight)
                {
                    var perc = that.winHeight/currentWinHeight;
                    that.winHeight = currentWinHeight;

                    that.classHeight = that.classHeight/perc;
                    that.glyphHeight = that.glyphHeight/perc;
                }

                // Height percent and width percent
                var heightPerc = currentHeight/that.classHeight;
                var widthPerc = currentWidth/that.classWidth;

                classEdit.style.height = heightPerc*100 + "%";
                glyphEdit.style.height = (1-heightPerc)*100 + "%";

                classEdit.style.width = widthPerc*100 + "%";
                glyphEdit.style.width = widthPerc*100 + "%";
                glyphTable.style.width = (1-widthPerc)*100 + "%";
                imgPrev.style.width = (1-widthPerc)*100 + "%";                

                // Coords of right of the class view = left for the glyph view
                var left = classEdit.getClientRects()[0].right;

                // Make sure the right side has the same corner as the left side
                imgPrev.style.left = left + "px";
                glyphTable.style.left = left + "px";

                // Specifically for the windows on the right
                heightPerc = glyphTable.getClientRects()[0].height/that.glyphHeight;
                glyphTable.style.height = 100*heightPerc + "%";
                imgPrev.style.height = (1-heightPerc)*100 + "%";

                var slider = document.getElementById("zoom-slider");
                var outer = document.getElementById("right2").getClientRects()[0]
                var top = outer.top + outer.height - 30;
                slider.style.top = top + "px";
                var left = outer.width + outer.left - slider.style.width.split("px")[0] - 25;
                slider.style.left = left + "px";


            });

            timer.tick("final");
        },

        /**
         * Open the GlyphEditView for editing a particular glyph.
         *
         * @param {Glyph} model - A Glyph model.
         */
        openGlyphEdit: function (model)
        {
            console.log("Open glyphedit!", model);
            this.glyphEditRegion.show(new GlyphEditView({
                model: model
            }));
        },

        /**
         * Open the GlyphMultiEditView for editing a particular collection of
         * Glyph models.
         *
         * @param {GlyphCollection} collection - Collection of glyphs to edit.
         */
        openMultiGlyphEdit: function (collection)
        {
            this.glyphEditRegion.show(new GlyphMultiEditView({
                collection: collection
            }));
        },

        /**
         * Open the ClassEditView for editing a class.
         *
         * @param TODO
         */
        openClassEdit: function(model)
        {
            console.log("Open classEdit!");

            this.glyphEditRegion.show(new ClassEditView({
                model: model
            }));

        },

        /**
         * This template has lots of localized strings.
         *
         * @returns {{classesHeader: *, editGlyphLabel: (*|string), editGlyphDescription: (*|string)}}
         */
        serializeData: function ()
        {
            return {
                classesHeader: Strings.classes,
                editGlyphLabel: Strings.editGlyphLabel,
                editGlyphDescription: Strings.editGlyphDescription
            }
        }
    });
