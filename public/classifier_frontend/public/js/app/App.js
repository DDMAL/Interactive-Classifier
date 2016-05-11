import $ from "jquery";
import Backbone from "backbone";
import RadioChannels from "radio/RadioChannels";
import Marionette from 'marionette';
import RootView from 'views/Root/RootView';
import MenuView from "views/MainMenu/MenuView";
import RodanDashBoardView from "views/RodanDashboard/RodanDashboardView";
import ModalViewModel from "views/widgets/Modal/ModalViewModel";
import ModalCollectionView from "views/widgets/Modal/ModalCollectionView";
import LoadingScreenView from "views/widgets/LoadingScreen/LoadingScreenView";
import LoadingScreenViewModel from "views/widgets/LoadingScreen/LoadingScreenViewModel";
import Page from "models/Page";
import GlyphEvents from "events/GlyphEvents";
import ModalEvents from "events/ModalEvents";
import MainMenuEvents from "events/MainMenuEvents";
import GlyphCollection from "collections/GlyphCollection";
import ConfirmView from "views/widgets/Confirm/ConfirmView";
import ConfirmViewModel from "views/widgets/Confirm/ConfirmViewModel";
import Strings from "localization/Strings";

var App = new Marionette.Application({
    modals: {},
    modalCollection: undefined,
    behaviors: {},

    changedGlyphs: new GlyphCollection(),

    onBeforeStart: function ()
    {
        // Instantiate the root view
        this.rootView = new RootView();
        this.rootView.navigation.show(new MenuView());

        // Create the modals
        this.initializeModals();

        // Menuchannel
        var that = this;
        this.listenTo(RadioChannels.menu, MainMenuEvents.clickSubmitCorrections,
            function()
            {
                that.modals.submitCorrections.open();
            }
        );
        this.listenTo(RadioChannels.menu, MainMenuEvents.clickFinalizeCorrections,
            function()
            {
                that.modals.finalizeCorrections.open();
            }
        );
        this.listenTo(RadioChannels.edit, GlyphEvents.changeGlyph, function(glyphModel)
        {
            that.changedGlyphs.add(glyphModel);
        });

        this.modals.loading.open();
    },

    onStart: function ()
    {
        console.log("onStart!");

        var that = this;
        setTimeout(
            function () {
                var pageElement = $("#page");
                var glyphsElement = $("#glyphs");

                // Extract the page image URL
                var binaryPageImage = pageElement.attr("data-page");
                var glyphs = JSON.parse(glyphsElement.attr("data-glyphs"));

                // Delete the data elements from the dom
                pageElement.remove();
                glyphsElement.remove();

                var glyphCollection = new GlyphCollection(glyphs);
                // Open the view to edit the page
                that.editPage(glyphCollection, binaryPageImage);
            },
            1000
        );
    },

    editPage: function(glyphCollection, image_path)
    {
        var page = new Page({
            binary_image: image_path
        });

        this.rootView.container.show(new RodanDashBoardView({
            model: page,
            collection: glyphCollection
        }));
        this.modals.loading.close();
    },

    /**
     * Submit corrections back to Rodan and run another round of gamera classification.
     */
    submitCorrections: function ()
    {
        var data = JSON.stringify({
            "glyphs": this.changedGlyphs.toJSON()
        });

        // Submit the corrections and close the window
        $.ajax({
            url: '',
            type: 'POST',
            data: data,
            contentType: 'application/json',
            complete: function (response)
            {
                console.log("Complete", response);

                // Close the window if successful POST
                if (response.status === 200)
                {
                    window.close();
                }
            }
        });
    },

    /**
     * Submit corrections back to Rodan.  If there are any corrections, run Gamera
     * and quit.  Otherwise, just quit.
     */
    finalizeAndQuit: function ()
    {
        var data = JSON.stringify({
            "complete": true,
            "glyphs": this.changedGlyphs.toJSON()
        });

        // Submit the corrections and close the window
        $.ajax({
            url: '',
            type: 'POST',
            data: data,
            contentType: 'application/json',
            complete: function (response)
            {
                console.log("Complete", response);
                // window.location = 'about:blank';

                // Close the window if successful POST
                if (response.status === 200)
                {
                    window.close();
                }
            }
        });
    },

    initializeModals: function()
    {
        var that = this;

        this.modalCollection = new Backbone.Collection();

        // Prepare the modal collection
        this.rootView.modal.show(new ModalCollectionView({
            collection: this.modalCollection
        }));

        // Loading modal
        this.modals.loading = new ModalViewModel({
            title: Strings.loadingPage,
            isCloseable: false,
            innerView: new LoadingScreenView({
                model: new LoadingScreenViewModel({
                    text: Strings.loadingGlyphs
                })
            })
        });
        this.modalCollection.add(this.modals.loading);

        // Submit Corrections modal
        this.modals.submitCorrections = new ModalViewModel({
            title: Strings.submitCorrections,
            isCloseable: true,
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

        // Finalize Corrections modal
        this.modals.finalizeCorrections = new ModalViewModel({
            title: Strings.finalizeCorrections,
            isCloseable: true,
            innerView: new ConfirmView({
                model: new ConfirmViewModel({
                    text: Strings.finalizeWarning,
                    callback: function ()
                    {
                        // Once the user confirms, submit the corrections.
                        that.finalizeAndQuit();
                    }
                })
            })
        });
        this.modalCollection.add(this.modals.finalizeCorrections);

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
    closeAllModals: function()
    {
        // Make sure all the modals are closed
        this.modalCollection.each(
            function(modal)
            {
                modal.close();
            }
        )
    }
});

App.on('initialize:before', function()
{
    // options.anotherThing = true; // Add more data to your options
});
App.on('initialize:after', function()
{
});

export default App;
