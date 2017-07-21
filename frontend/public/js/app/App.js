import $ from "jquery";
import Backbone from "backbone";
import RadioChannels from "radio/RadioChannels";
import Radio from 'backbone.radio';
import Marionette from "marionette";
import RootView from "views/Root/RootView";
import MenuView from "views/MainMenu/MenuView";
import RodanDashboardView from "views/RodanDashboard/RodanDashboardView";
import ModalViewModel from "views/widgets/Modal/ModalViewModel";
import ModalCollectionView from "views/widgets/Modal/ModalCollectionView";
import LoadingScreenView from "views/widgets/LoadingScreen/LoadingScreenView";
import LoadingScreenViewModel from "views/widgets/LoadingScreen/LoadingScreenViewModel";
import ClassEvents from "events/ClassEvents";
import GlyphEvents from "events/GlyphEvents";
import ModalEvents from "events/ModalEvents";
import MainMenuEvents from "events/MainMenuEvents";
import Glyph from "models/Glyph";
import GlyphCollection from "collections/GlyphCollection";
import ConfirmView from "views/widgets/Confirm/ConfirmView";
import ConfirmViewModel from "views/widgets/Confirm/ConfirmViewModel";
import ModifySettingsViewModel from "views/widgets/ModifySettings/ModifySettingsViewModel";
import ModifySettingsView from "views/widgets/ModifySettings/ModifySettingsView";
import Strings from "localization/Strings";
import Timer from "utils/Timer";
import Authenticator from "auth/Authenticator";

var App = Marionette.Application.extend(
    /**
     * @lends App.prototype
     */
    {
        modals: {},
        modalCollection: undefined,
        behaviors: {},
        changedGlyphs: new GlyphCollection(),
        groupedGlyphs: [],

        /**
         * @class App
         *
         * App is the Interactive Classifier application.
         *
         * @constructs App
         */
        initialize: function ()
        {
            // Authenticator object is used to maintain token authentication with the Rodan web server.
            this.authenticator = new Authenticator();
            this.authenticator.startTimedAuthentication();
        },

        /**
         * This function runs before the application starts.  It instantiates the RootView and sets up radio listeners.
         */
        onBeforeStart: function ()
        {
            //Instantiate the root view
            this.rootView = new RootView();
            this.rootView.navigation.show(new MenuView());

            /* Create the modals*/
            this.initializeModals();

            /* Menuchannel*/
            var that = this;
            this.listenTo(RadioChannels.menu, MainMenuEvents.clickSubmitCorrections, function ()
            {
                that.modals.submitCorrections.open();
            });
            this.listenTo(RadioChannels.menu, MainMenuEvents.clickGroupClassify, function ()
            {
                that.modals.groupReclassify.open();
            });
            this.listenTo(RadioChannels.menu, MainMenuEvents.clickFinalizeCorrections, function ()
            {
                that.modals.finalizeCorrections.open();
            });
            this.listenTo(RadioChannels.menu, MainMenuEvents.clickTest, function ()
            {
                that.modals.opening.open();
            });
            this.listenTo(RadioChannels.edit, GlyphEvents.changeGlyph, function (glyphModel)
            {
                that.changedGlyphs.add(glyphModel);
            });
            this.listenTo(RadioChannels.edit, ClassEvents.deleteClass, function (glyphModel)
            {
                that.changedGlyphs.add(glyphModel);
            });

            // A loading screen pops up. TODO: should maybe wait until celery completes
            this.listenTo(RadioChannels.edit, GlyphEvents.addGlyph, function (glyphModel)
            {
                this.modals.group.close();
            });

            this.listenTo(RadioChannels.edit, GlyphEvents.groupGlyphs, function (glyphList, glyphName)
            {
                var groupedGlyphs = new GlyphCollection();
                for(var i=0; i < glyphList.length; i++)
                {
                    groupedGlyphs.add(glyphList[i]);
                }
                this.modals.group.open();                
                that.groupGlyphs(groupedGlyphs, glyphName);
            });
            this.modals.loading.open();
        },

        /**
         * This function runs when the application starts.
         *
         * The function extracts glyph data, class names, and preview image path data from the HTML page.  The function
         * then deletes those elements.
         *
         * Next, we initialize the RodanDashboardView.  We wait two seconds (so that the loading screen modal can
         * successfully open) and then render the view.
         */
        onStart: function ()
        {
            // Timer that we will use for profiling
            var timer = new Timer("App.js onStart");

            var pageElement = $("#page");
            var glyphsElement = $("#glyphs");
            var classNamesElement = $("#classNames");

            timer.tick();

            // Extract the page image URL
            var binaryPageImage = pageElement.attr("data-page");
            var glyphDictionary = JSON.parse(glyphsElement.attr("data-glyphs"));
            var classNames = JSON.parse(classNamesElement.attr("data-class-names"));

            timer.tick();

            // Delete the data elements from the dom
            pageElement.remove();
            glyphsElement.remove();
            classNamesElement.remove();

            timer.tick();

            // Open the view to edit the page
            var view = new RodanDashboardView({
                model: new Backbone.Model({
                    binaryImage: binaryPageImage,
                    glyphDictionary: glyphDictionary,
                    classNames: classNames
                })
            });

            timer.tick();

            var that = this;
            setTimeout(function ()
            {
                that.rootView.container.show(view);
                that.modals.loading.close();
            }, 2000);
        },

        /**
         *  Submit corrections back to Rodan and run another round of gamera classification.
         */
        submitCorrections: function ()
        {
            var data = JSON.stringify({
                "glyphs": this.changedGlyphs.toJSON(),
                "grouped_glyphs": this.groupedGlyphs
            });
            // Submit the corrections and close the window
            $.ajax({
                url: this.authenticator.getWorkingUrl(),
                type: 'POST',
                data: data,
                contentType: 'application/json',
                complete: function (response)
                {
                    /* Close the window if successful POST*/
                    if (response.status === 200)
                    {
                        window.close();
                    }
                }
            });
        },

        /**
         *  Group and reclassify.
         */
        groupReclassify: function (userSelections)
        {
            var data = JSON.stringify({
                "glyphs": this.changedGlyphs.toJSON(),
                "grouped_glyphs": this.groupedGlyphs,
                "auto_group": true,
                "user_options": userSelections
            });
            // Submit the corrections and close the window
            $.ajax({
                url: this.authenticator.getWorkingUrl(),
                type: 'POST',
                data: data,
                contentType: 'application/json',
                complete: function (response)
                {
                    /* Close the window if successful POST*/
                    if (response.status === 200)
                    {
                        window.close();
                    }
                }
            });
        },

        /**
         * Submit corrections back to Rodan.  If there are any corrections, run Gamera and quit.  Otherwise, just quit.
         *
         */
        finalizeAndQuit: function ()
        {
            var data = JSON.stringify({
                "complete": true,
                "glyphs": this.changedGlyphs.toJSON(),
                "grouped_glyphs": this.groupedGlyphs,
            });
            /* Submit the corrections and close the window*/
            $.ajax({
                url: this.authenticator.getWorkingUrl(),
                type: 'POST',
                data: data,
                contentType: 'application/json',
                complete: function (response)
                {
                    /* Close the window if successful POST*/
                    if (response.status === 200)
                    {
                        window.close();
                    }
                }
            });
        },

        /**
         *  Testing Button
         */
        opening: function ()
        {
            var x = document.getElementById("inputFile");
            var project = window.location.href.split("/")[2];
            Radio.channel('rodan').trigger('REQUEST__RESOURCE_CREATE', {project: project, file: x});
            var resource = new Resource({project:project, file: x, resource_type : 'application/gamera+xml(xml)'});
            console.log(resource);
            var data = JSON.stringify({
                "importXML": true,
                "XML": x,
                "glyphs": this.changedGlyphs.toJSON()
            });
            //placeholder for sending the request
            
            $.ajax({
                url: this.authenticator.getWorkingUrl(),
                type: 'POST',
                data: data,
                contentType: 'application/json',
                complete: function (response)
                {
                    /* Close the window if successful POST*/
                    if (response.status === 200)
                    {
                        alert("Success!");
                    }
                    else
                    {
                        alert("Failed!");
                    }
                }
            });
        },

        /**
        * Find glyphs
        * Returns a collection full of all the original glyphs, without any grouped glyphs
        * list is the new collection of glyphs, originally empty
        * This function is necessary when the user tries to group the same glyph twice without sending corretions
        */

        findGroups: function (glyphs, list)
        {
            var that = this;
            for(var i=0; i < glyphs.length; i++)
            {
                var glyph =  glyphs.at(i)
                if('parts' in glyph && glyph['parts'].length > 0)
                {
                    that.findGroups(glyph['parts'], list);
                }
                else
                {
                    list.add(glyph);
                }
            }

            return list;

        },

        /**
         *  Group glyphs
         *
         */
        groupGlyphs: function (grouped_glyphs, className)
        {
            var that = this;

            var glyphs = that.findGroups(grouped_glyphs, new GlyphCollection());


            if(glyphs.length > 0)
            {
                var data = JSON.stringify({
                    "group": true,
                    "glyphs": glyphs.toJSON(),
                    "class_name": className
                });   

                $.ajax({
                    url: this.authenticator.getWorkingUrl(),
                    type: 'POST',
                    data: data,
                    headers: {
                    Accept: "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                    },
                    complete: function (response)
                    {
                        // Create the new glyph
                        if (response.status === 200)
                        {
                            var responseData = JSON.parse(response.responseText);
                             var g = new Glyph({
                                "id": responseData["id"],
                                "class_name": className,
                                "id_state_manual": true,
                                "confidence": 1,
                                "ulx": responseData["ulx"],
                                "uly": responseData["uly"],
                                "nrows": responseData["nrows"],
                                "ncols": responseData["ncols"],
                                "image_b64": (responseData["image"]),
                                "rle_image": (responseData["rle_image"]),
                            });

                             // If the user wants to group this glyph again, they'll need to access the group parts
                             g['parts'] = glyphs;
                                                         
                            RadioChannels.edit.trigger(GlyphEvents.openGlyphEdit, g);
                                                        
                            g.onCreate();
                            // The data gets saved to send to celery later

                            that.groupedGlyphs.push(responseData);
                        }
                    }
                });
            }
            else
            {
                console.log("You cannot group 0 glyphs");
                this.modals.group.close();
            }
        },        
        /**
         * Initialize all of the modals used in the application.
         */
        initializeModals: function ()
        {
            this.modalCollection = new Backbone.Collection();

            // Prepare the modal collection
            this.rootView.modal.show(new ModalCollectionView({collection: this.modalCollection}));

            // Loading modal
            this.modals.loading = new ModalViewModel({
                title: Strings.loadingPage,
                isCloseable: false,
                isHiddenObject: false,
                innerView: new LoadingScreenView({
                    model: new LoadingScreenViewModel({
                        text: Strings.loadingGlyphs
                    })
                })
            });
            this.modalCollection.add(this.modals.loading);

            var that = this;
            // Submit Corrections modal
            this.modals.submitCorrections = new ModalViewModel({
                title: Strings.submitCorrections,
                isCloseable: true,
                isHiddenObject: false,
                innerView: new ConfirmView({
                    model: new ConfirmViewModel({
                        text: Strings.submissionWarning,
                        callback: function ()
                        {
                            // Once the user confirms, submit the corrections.
                            that.submitCorrections();
                        }
                    })
                })
            });
            this.modalCollection.add(this.modals.submitCorrections);

            // Group and reclassify modal
            this.modals.groupReclassify = new ModalViewModel({
                title: Strings.submitAndGroup,
                isCloseable: true,
                isHiddenObject: false,
                innerView: new ModifySettingsView({
                    model: new ModifySettingsViewModel({
                        text: Strings.groupWarning,
                        // A list of dictionaries that maps to functions or something
                        // The types are checkbox, user fill in (input) and dropdown
                        userOptions: [
                        {"text": "Grouping Function", "type": "dropdown", "options": ["Bounding Box", "Shaped"]},
                        {"text": "Distance Threshold", "type": "input", "default": 4},
                        {"text": "Maximum number of parts per group", "type": "input", "default": 4},
                        {"text": "Maximum Solveable subgraph size", "type": "input", "default": 16},
                        {"text": "Grouping criterion", "type": "dropdown", "options": ["min", "avg"]},
                        ],
                        callback: function (userArgs)
                        {
                            // Once the user confirms, submit the corrections with the user's options.

                            var userSelections = {}

                            // TODO: make more elegant

                            userSelections['func'] = userArgs["Grouping Function"]
                            userSelections['distance'] = userArgs["Distance Threshold"]
                            userSelections['parts'] = userArgs["Maximum number of parts per group"]
                            userSelections['graph'] = userArgs["Maximum Solveable subgraph size"]
                            userSelections['criterion'] = userArgs["Grouping criterion"]

                            that.groupReclassify(userSelections);
                        }
                    })
                })
            });
            this.modalCollection.add(this.modals.groupReclassify);

            // Finalize Corrections modal
            this.modals.finalizeCorrections = new ModalViewModel({
                title: Strings.finalizeCorrections,
                isCloseable: true,
                isHiddenObject: false,
                innerView: new ConfirmView({
                    model: new ConfirmViewModel({
                        text: Strings.finalizeText,
                        warning: Strings.finalizeWarning,
                        callback: function ()
                        {
                            // Once the user confirms, submit the corrections.
                            that.finalizeAndQuit();
                        }
                    })
                })
            });
            this.modalCollection.add(this.modals.finalizeCorrections);

            // testing modal
            this.modals.opening = new ModalViewModel({
                title: Strings.openTitle,
                isCloseable: true,
                isHiddenObject: true,
                innerView: new ConfirmView({
                    model: new ConfirmViewModel({
                        text: Strings.openWarning,
                        callback: function ()
                        {
                            // Once the user confirms, submit the corrections.
                            that.opening();
                        }
                    })
                })
            });
            this.modalCollection.add(this.modals.opening);

            // group modal
            this.modals.group = new ModalViewModel({
                title: Strings.groupTitle,
                isCloseable: false,
                isHiddenObject: false,
                innerView: new LoadingScreenView({
                    model: new LoadingScreenViewModel({
                        text: Strings.groupingGlyphs,
                        callback: function ()
                        {

                        }
                    })
                })
            });
            this.modalCollection.add(this.modals.group);
            // Listen to the "closeAll" channel
            RadioChannels.modal.on(ModalEvents.closeAll,
                function ()
                {
                    that.closeAllModals();
                }
            );
        },

        /**
         * Close all open modal windows!
         */
        closeAllModals: function ()
        {
            // Make sure all the modals are closed
            this.modalCollection.each(
                function (modal)
                {
                    modal.close();
                }
            )
        }
    });

export default new App();
