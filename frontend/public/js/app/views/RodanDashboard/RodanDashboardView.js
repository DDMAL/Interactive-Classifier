import $ from 'jquery';
import _ from "underscore";
import Backbone from "backbone";
import Marionette from "marionette";
import ClassEvents from "events/ClassEvents";
import GlyphEvents from "events/GlyphEvents";
import PageEvents from "events/PageEvents";
import MainMenuEvents from "events/MainMenuEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import ClassEditView from "views/ClassEdit/ClassEditView";
import GlyphMultiEditView from "views/GlyphMultiEdit/GlyphMultiEditView";
import TrainingEditView from "views/TrainingEdit/TrainingEditView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";
import ImagePreviewView from "views/ImagePreview/ImagePreviewView";
import ImagePreviewViewModel from "views/ImagePreview/ImagePreviewViewModel";
import RadioChannels from "radio/RadioChannels";
import Strings from "localization/Strings";
import Timer from "utils/Timer";
import template from "./rodan-dashboard.template.html";
// import each from "underscore";

var RodanDashboardView = Marionette.LayoutView.extend(
    /**
     * @lends RodanDashboardView.prototype
     */
    {
        template,
        regions: {
            classCreateRegion: ".glyph-class-create-region",
            glyphTreeRegion: ".glyph-class-tree-region",
            glyphTableRegion: ".glyph-table-region",
            classifierTableRegion: ".classifier-table-region",
            glyphEditRegion: ".glyph-edit-region",
            pagePreviewRegion: ".page-image-preview-region",
            modalTestRegion: ".modal-test"
        },

        events: {
            "mousedown": "onMouseDown",
            "click #save": "saveChanges",
            "click #revert": "revertChanges"
        },

        classifierCount: 0,
        pageCount: 0,
        selectedCount: 0,

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
                    backgroundImage: this.model.get("previewImage")
                })
            });
            this.isMouseDown = true,
            // Construct the glyph table data structure
            this.trainingRowCollection = new GlyphTableRowCollection();
            this.trainingRowCollection.setClassifier(true);
            this.tableRowCollection = new GlyphTableRowCollection();
            this.tableRowCollection.setClassifier(false);
            this.isCollapsed = false;
            this.classifierRowCollection = new GlyphTableRowCollection();

            this.listenTo(RadioChannels.edit, PageEvents.changeBackground,
                function()
                {
                    // This makes it so the classes switch color
                    // so it's obvious to which class each glyph belongs
                    // TODO: This should be improved so only one loop
                    var els = document.getElementsByClassName("table table-hover")[0].childNodes;
                    // White and grey
                    var colors = ["white","gainsboro"];
                    for (var i = 0; i < els.length; i++)
                    {
                        // Alternating
                        var index = i % 2;
                        els[i].style.backgroundColor = colors[index];
                    }
                    els = document.getElementsByClassName("table table-hover")[1].childNodes;
                    for (var j = 0; j < els.length; j++)
                    {
                        // Alternating
                        index = j % 2;
                        els[j].style.backgroundColor = colors[index];
                    }
                }
            );

            // Selected Glyphs
            this.selectedGlyphs = new Backbone.Collection();
            var that = this;
            this.listenTo(RadioChannels.edit, GlyphEvents.selectGlyph,
                function (glyph)
                {
                    that.selectedGlyphs.add(glyph);
                    that.selectedCount = that.selectedGlyphs.length;
                    document.getElementById("count-selected").innerHTML = that.selectedCount;
                }
            );
            this.listenTo(RadioChannels.edit, GlyphEvents.deselectGlyph,
                function (glyph)
                {
                    that.selectedGlyphs.remove(glyph);
                    that.selectedCount = that.selectedGlyphs.length;
                    document.getElementById("count-selected").innerHTML = that.selectedCount;
                }
            );
            this.listenTo(RadioChannels.edit, GlyphEvents.deselectAllGlyphs,
                function ()
                {
                    that.selectedGlyphs.reset();
                    that.selectedCount = 0;
                    document.getElementById("count-selected").innerHTML = that.selectedCount;
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.addGlyph,
                function (glyph, className)
                {
                    that.tableRowCollection.addGlyph(glyph, className);
                    // jscs:disable
                    if (className.toLowerCase() !== "unclassified" && !className.startsWith("_group._part") && !className.startsWith("_split"))
                    {
                        that.trainingRowCollection.addGlyph(glyph, className);
                    }
                    // jscs:enable
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.deleteGlyphs,
                function (glyphs)
                {
                    for (var i = 0; i < glyphs.length; i++)
                    {
                        var glyph = glyphs[i];
                        that.tableRowCollection.deleteGlyph(glyph);
                        that.trainingRowCollection.deleteGlyph(glyph);
                        if (glyph.get("is_training"))
                        {
                            that.classifierCount--;
                        }
                        else if (glyph.get("id_state_manual"))
                        {
                            that.classifierCount--;
                            that.pageCount--;
                        }
                        else
                        {
                            that.pageCount--;
                        }
                    }
                    that.selectedCount = 0;
                    document.getElementById("count-classifier").innerHTML = that.classifierCount;
                    document.getElementById("count-page").innerHTML = that.pageCount;
                    document.getElementById("count-selected").innerHTML = that.selectedCount;
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.setGlyphName,
              function(className)
              {
                  //Don't add the new class if it's already in the list or if it's a part of a group or a split
                  if (!className.startsWith("_group._part") && !className.startsWith("_split"))
                  {
                      var index = that.model.get('classNames').findIndex(name => name === className);
                      if (index === -1)
                      {
                          var classNameList = that.model.get('classNames').push(className);
                          classNameList = that.model.get('classNames').sort();
                          that.model.set('classNames', classNameList);
                      }
                  }
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
                    for (var i = 0; i < classes.length; i++)
                    {
                        var name = classes[i];
                        if (name === className || name.startsWith(className + "."))
                        {
                            that.tableRowCollection.deleteClass(name);
                            that.trainingRowCollection.deleteClass(name);
                        }
                    }
                    var newClasses = this.model.get('classNames').filter(function (name)
                    {
                        return !name.startsWith(className + ".") && name !== className;
                    });
                    this.model.set('classNames', newClasses);
                });

            this.listenTo(RadioChannels.edit, ClassEvents.renameClass,
                function(oldName, newName)
                {
                    var classes = this.model.get('classNames');
                    for (var i = 0; i < classes.length; i++)
                    {
                        var name = classes[i];
                        if (name === oldName || name.startsWith(oldName + "."))
                        {
                            that.tableRowCollection.renameClass(name, oldName, newName);
                            that.trainingRowCollection.renameClass(name, oldName, newName);
                        }
                    }
                    for (var j = 0; j < classes.length; j++)
                    {
                        if (classes[j] === oldName || classes[j].startsWith(oldName + "."))
                        {
                            classes[j] = classes[j].replace(oldName, newName);
                        }
                    }
                    //remove duplicates
                    var renamedClasses = classes.filter(function(item, pos)
                    {
                        return classes.indexOf(item) === pos;
                    });
                    this.model.set('classNames', renamedClasses);
                });

            // Glyph Editing Events
            this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit,
                function (model)
                {
                    // If it's a training glyph, open the training edit view
                    if (model.attributes.is_training)
                    {
                        that.selectedGlyphs.add(model);
                        that.openTrainingEdit(that.selectedGlyphs);
                    }
                    else
                    {
                        that.previewView.highlightGlyph([model]);
                        that.openGlyphEdit(model);
                    }
                });
            this.listenTo(RadioChannels.edit, GlyphEvents.moveGlyph,
                function (glyph, oldClassName, newClassName)
                {
                    if (glyph.attributes.is_training)
                    {
                        that.trainingRowCollection.moveGlyph(glyph, oldClassName, newClassName);
                    }
                    else
                    {
                        that.tableRowCollection.moveGlyph(glyph, oldClassName, newClassName);
                        that.trainingRowCollection.moveGlyph(glyph, oldClassName, newClassName);
                    }
                    that.pageCount = 0;
                    that.classifierCount = 0;
                    that.tableRowCollection.each(function (row)
                    {
                        var glyphs = row.get("glyphs");
                        that.pageCount += glyphs.length;
                    });
                    that.trainingRowCollection.each(function (row)
                    {
                        var glyphs = row.get("glyphs");
                        that.classifierCount += glyphs.length;
                    });
                    document.getElementById("count-classifier").innerHTML = that.classifierCount;
                    document.getElementById("count-page").innerHTML = that.pageCount;
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.groupGlyphs,
                function ()
                {
                    that.classifierCount++;
                    that.pageCount++;
                    document.getElementById("count-selected").innerHTML = 1;
                    document.getElementById("count-classifier").innerHTML = that.classifierCount;
                    document.getElementById("count-page").innerHTML = that.pageCount;
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.splitGlyph,
                function ()
                {
                    // After splitting, wait for the DOM to update, then update the count variables
                    var waitTime = 1000;
                    setTimeout(function ()
                    {
                        var newPageCount = parseInt($("#count-page").text());
                        var newClassifierCount = parseInt($("#count-classifier").text());
                        that.pageCount = newPageCount;
                        that.classifierCount = newClassifierCount;
                    }, waitTime);
                }
            );

            this.listenTo(RadioChannels.edit, PageEvents.zoom,
                function (zoomLevel)
                {
                    var pic = document.getElementsByClassName("preview-background")[0];
                    var oldHeight = pic.dataset.originalHeight;
                    var newHeight = oldHeight * zoomLevel / document.getElementById("s1").getAttribute("default"); //60 is the default value
                    pic.style.height = newHeight + "px";
                    // makes sure the boxes around the glyphs follow the zoom
                    RadioChannels.edit.trigger(GlyphEvents.highlightGlyphs, that.selectedGlyphs);

                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.highlightGlyphs,
                function(highlightedGlyphs)
                {
                    var glyphs = [];
                    for (var i = 0; i < highlightedGlyphs.length; i++)
                    {
                        var glyph = highlightedGlyphs.at(i);
                        glyphs.push(glyph);
                    }
                    that.previewView.highlightGlyph(glyphs);
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.openMultiEdit,
                function ()
                {
                    // if some of the glyphs selected are training glyphs
                    var training_glyphs = new Backbone.Collection();
                    var glyphs = new Backbone.Collection();
                    // Separating training glyphs from page glyphs
                    for (var i = 0; i < that.selectedGlyphs.length; i++)
                    {
                        var glyph = that.selectedGlyphs.at(i);
                        var name = glyph.attributes.class_name;
                        if (name.startsWith("_group") || name.startsWith("_split"))
                        {
                            // don't add to either window
                        }
                        else if (glyph.attributes.is_training)
                        {
                            training_glyphs.add(glyph);
                        }
                        else
                        {
                            glyphs.add(glyph);
                        }
                    }
                    // Only page glyphs are selected
                    if (training_glyphs.length === 0)
                    {
                        if (glyphs.length === 1)
                        {
                            that.openGlyphEdit(glyphs.at(0));
                        }
                        else
                        {
                            that.openMultiGlyphEdit(glyphs);
                        }
                        RadioChannels.edit.trigger(GlyphEvents.highlightGlyphs, glyphs);
                    }
                    // At least one training glyph is selected
                    else
                    {
                        that.openTrainingEdit(that.selectedGlyphs);
                    }
                }
            );

            this.listenTo(RadioChannels.edit, GlyphEvents.openTrainingEdit,
                function ()
                {
                    that.openTrainingEdit(that.selectedGlyphs);
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
            var trainingGlyphs = this.model.get("trainingGlyphs");

            // Show the tree
            this.glyphTreeRegion.show(new ClassTreeView({
                model: new ClassTreeViewModel({
                    class_names: classNames
                })
            }));

            timer.tick();

            var glyphCollections = {};
            var trainingGlyphsCollection = {};

            // Separate the glyphs by their class
            for (var i = 0; i < classNames.length; i++)
            {
                var glyphs = new GlyphCollection(glyphDictionary[classNames[i]]);
                if (glyphs.length > 0)
                {
                    glyphCollections[classNames[i]] = glyphs;
                }
                if (trainingGlyphs)
                {
                    glyphs = new GlyphCollection(trainingGlyphs[classNames[i]]);
                    if (glyphs.length > 0)
                    {
                        trainingGlyphsCollection[classNames[i]] = glyphs;
                    }
                }
            }

            timer.tick("pre-final render");

            var that = this;
            _.each(classNames, function (className)
            {
                if (glyphCollections[className])
                {
                    var row = new GlyphTableRowViewModel({
                        class_name: className,
                        glyphs: glyphCollections[className]
                    });
                    that.pageCount += glyphCollections[className].length;
                    that.tableRowCollection.add(row);
                }
                if (trainingGlyphsCollection[className])
                {
                    row = new GlyphTableRowViewModel({
                        class_name: className,
                        glyphs: trainingGlyphsCollection[className]
                    });
                    that.classifierCount += trainingGlyphsCollection[className].length;
                    that.trainingRowCollection.add(row);
                }
            });

            document.getElementById("count-classifier").innerHTML = this.classifierCount;
            document.getElementById("count-page").innerHTML = this.pageCount;
            document.getElementById("count-selected").innerHTML = this.selectedCount;

            timer.tick();

            this.glyphTableRegion.show(new GlyphTableView({
                collection: this.tableRowCollection
            }));
            this.classifierTableRegion.show(new GlyphTableView({
                collection: this.trainingRowCollection
            }));

            RadioChannels.edit.trigger(PageEvents.changeBackground);

            // This section deals with resizing.

            $('#right0').collapse('toggle');

            /* TODO: the decimals here are harcoded (they are the original percentages for height/width)
             * These values should be found through the document somehow.
             * These values are all the original values for the heights/widths of certain elements
             *
             * The values of the client rectangles have already been reduced by the percentages shown
             * To get the original heights of the rectangles, I have to divide by the percentage
             * All of these values were taken from styles.scss (again, these should be accessed in this file)
             */

            this.classHeight = document.getElementById("left1").getClientRects()[0].height / 0.5;
            this.classWidth = document.getElementById("left1").getClientRects()[0].width / 0.25;
            this.glyphHeight = document.getElementById("right1").getClientRects()[0].height / 0.31;
            this.imgHeight = document.getElementById("right2").getClientRects()[0].height / 0.31;
            this.collapseHeight = document.getElementById("collapse-button").getClientRects()[0].height;
            this.collapseWidth  = document.getElementById("collapse-button").getClientRects()[0].width;
            this.winWidth = window.innerWidth;
            this.winWidth = window.innerWidth;
            this.winHeight = window.innerHeight;

            var elms = document.getElementsByClassName("glyph-image-container");
            for (i = 0; i < elms.length; i++)
            {
                var child = elms[i].childNodes[0].childNodes[1].childNodes[1];
                child.dataset.originalWidth = child.getAttribute("width");
                child.dataset.originalHeight = child.getAttribute("height");
            }
            $(document).mousemove(function (event)
            {
                if (that.isMouseDown)
                {
                    // Mouse up, no longer resizing
                    if (event.buttons === 0)
                    {
                        that.resize = false;
                        that.isMouseDown = false;
                    }
                    if (this.isCollapsed !== $('#right0').attr("aria-expanded"))
                    {
                        that.resize = true;
                        this.isCollapsed = $('#right0').attr("aria-expanded");
                    }

                    // Each region of the window
                    var glyphEdit = document.getElementById("left2");
                    var glyphTable = document.getElementById("right1");
                    var imgPrev = document.getElementById("right2");
                    var classEdit = document.getElementById("left1");
                    var trainingGlyphs = document.getElementById("right0");
                    var collapseButton = document.getElementById("collapse-button");

                    // I make sure the height/width is the same as the original height/width
                    // (It doesn't change on resize)
                    collapseButton.style.height = that.collapseHeight + "px";
                    collapseButton.style.width = that.collapseWidth + "px";

                    // Current height and width of the class view
                    var currentHeight = classEdit.getClientRects()[0].height;
                    var currentWidth = classEdit.getClientRects()[0].width;

                    // Current height and width of the entire window
                    var currentWinHeight = window.innerHeight;
                    var currentWinWidth = window.innerWidth;

                    // The percentage of trainingGlyphs height. The glyph table height depends on this
                    if (trainingGlyphs.getClientRects()[0])
                    {
                        glyphTable.style.top = trainingGlyphs.getClientRects()[0].bottom + "px";
                        that.resize = true;
                    }
                    else
                    {
                        // If the classifier glyphs are collapsed,
                        // the top of the glyph table should touch the bottom of the button
                        // jscs:disable
                        glyphTable.style.top = document.getElementById("collapse-button").getClientRects()[0].bottom + "px";
                        //jscs:enable
                    }

                    imgPrev.style.top = glyphTable.getClientRects()[0].bottom + "px";

                    // We need to find the height percentage of imgPrev now;
                    // The height of imgPrev is the space between the bottom of the page and
                    // the bottom of the glyph table

                    imgPrev.style.height = innerHeight - glyphTable.getClientRects()[0].bottom + "px";

                    // Coords of right of the class view = left for the glyph view
                    var left = classEdit.getClientRects()[0].right;

                    // Make sure the right side has the same corner as the left side
                    imgPrev.style.left = left + "px";
                    glyphTable.style.left = left + "px";
                    trainingGlyphs.style.left = left + "px";
                    collapseButton.style.left = left + "px";

                    // This region deals with changing the height and width percentages on resize
                    // Resize = true when the height/width needs to be changed

                    // If the window has been resized, the original widths/heights must be modified
                    // By the same percentage (ratio)
                    if (that.winWidth !== currentWinWidth)
                    {
                        // Width percentage
                        var wPerc = that.winWidth / currentWinWidth;
                        that.winWidth = currentWinWidth;
                        that.classWidth = that.classWidth / wPerc;

                        that.resize = true;
                    }

                    if (that.winHeight !== currentWinHeight)
                    {
                        // Height percentage
                        var hPerc = that.winHeight / currentWinHeight;
                        that.winHeight = currentWinHeight;

                        that.classHeight = that.classHeight / hPerc;
                        that.glyphHeight = that.glyphHeight / hPerc;

                        that.resize = true;
                    }

                    // Makes sure the user actually resizes a window by checking that the mouse is on the resize button
                    var resizeLeft = (classEdit.getClientRects()[0].left + classEdit.getClientRects()[0].width);
                    var resizeBottom = (classEdit.getClientRects()[0].top + classEdit.getClientRects()[0].height);
                    // jscs:disable
                    if (event.clientX < resizeLeft && event.clientX > (resizeLeft - 20) && event.clientY < resizeBottom && event.clientY > (resizeBottom - 20))
                    // jscs:enable
                    {
                        that.resize = true;
                    }
                    resizeLeft = (glyphTable.getClientRects()[0].left + glyphTable.getClientRects()[0].width);
                    resizeBottom = (glyphTable.getClientRects()[0].top + glyphTable.getClientRects()[0].height);
                    // jscs:disable
                    if (event.clientX < resizeLeft && event.clientX > (resizeLeft - 20) && event.clientY < resizeBottom && event.clientY > (resizeBottom - 20))
                    // jscs:enable
                    {
                        that.resize = true;
                    }

                    if (that.resize)
                    {
                        // Height percent and width percent of the class window, (left1)
                        // The height of the edit window depends on this height
                        // The width of all windows depend on this width as well
                        var heightPerc = currentHeight / that.classHeight;
                        var widthPerc = currentWidth / that.classWidth;

                        // The decimals need to be changed into percentages
                        // To find the width/height of the other windows, use 1-percentage
                        classEdit.style.height = Math.round(heightPerc * 100) + "%";
                        glyphEdit.style.height = Math.round((1 - heightPerc) * 100) + "%";
                        classEdit.style.width = Math.round(widthPerc * 100) + "%";
                        glyphEdit.style.width = Math.round(widthPerc * 100) + "%";

                        imgPrev.style.width = Math.round((1 - widthPerc) * 100) + "%";
                        trainingGlyphs.style.width = Math.round((1 - widthPerc) * 100) + "%";
                        glyphTable.style.width = Math.round((1 - widthPerc) * 100) + "%";

                        // How the slider moves on resize
                        // The 35 and 25 are hardcoded values that seem to place the slider in a good position
                        var slider = document.getElementById("zoom-slider");
                        var outer = document.getElementById("right2").getClientRects()[0];
                        var top = outer.top + outer.height - 35;
                        slider.style.top = top + "px";
                        left = outer.width + outer.left - slider.style.width.split("px")[0] - 25;
                        slider.style.left = left + "px";

                        var outer2 = document.getElementById("right2").getClientRects()[0];
                        var slider2 = document.getElementById("glyph-zoom");
                        slider2.style.left = left + "px";
                        slider2.style.top = outer2.top - 35 + "px";

                    }
                }
            });

            timer.tick("final");
        },

        onMouseDown: function ()
        {
            this.isMouseDown = true;
        },

        saveChanges: function (event)
        {
            if (event)
            {
                event.preventDefault();
            }
            RadioChannels.menu.trigger(MainMenuEvents.clickSaveChanges);
        },

        revertChanges: function (event)
        {
            if (event)
            {
                event.preventDefault();
            }
            RadioChannels.menu.trigger(MainMenuEvents.clickUndoAll);
        },

        /**
         * Open the GlyphEditView for editing a particular glyph.
         *
         * @param {Glyph} model - A Glyph model.
         */
        openGlyphEdit: function (model)
        {
            console.log("Open glyphEdit!");
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
         * Open the TrainingEditView for editing a particular collection of
         * Training glyph models.
         *
         * @param {GlyphCollection} collection - Collection of training glyphs to edit.
         */
        openTrainingEdit: function (collection)
        {
            this.glyphEditRegion.show(new TrainingEditView({
                collection: collection
            }));
        },

        /**
         * Open the ClassEditView for editing a class.
         *
         * @param {Class} model - a Class model
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
                editGlyphDescription: Strings.editGlyphDescription,
                saveChanges: Strings.saveChanges,
                revert: Strings.undoAll,
                classifierGlyphs: Strings.classifierGlyphs,
                pageGlyphs: Strings.pageGlyphs,
                selectedGlyphs: Strings.selectedGlyphs
            }
        }
    });

export default RodanDashboardView;
