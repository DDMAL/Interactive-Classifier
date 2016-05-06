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
import Strings from "./localization/Strings";

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
        RadioChannels.menu.on(MainMenuEvents.clickSubmitCorrections,
            function()
            {
                that.modals.submitCorrections.open();
            }
        );
        RadioChannels.menu.on(MainMenuEvents.clickFinalizeCorrections,
            function()
            {
                that.modals.finalizeCorrections.open();
            }
        );

        // Extract the page image URL
        var binaryPageImage = $("#page").attr("data-page");
        var glyphs = JSON.parse($("#glyphs").attr("data-glyphs"));

        var glyphCollection = new GlyphCollection(glyphs);

        // Open the view to edit the page
        this.editPage(glyphCollection, binaryPageImage);

        RadioChannels.edit.on(GlyphEvents.changeGlyph, function(glyphModel)
        {
            that.changedGlyphs.add(glyphModel);
        });
    },

    editPage: function(glyphCollection, image_path)
    {
        // Send out an event to close all of the open modals before starting
        // the page load process
        this.closeAllModals();

        this.modals.loading.open();

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
        console.log("SUBMIT CORRECTIONS!");

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
                // window.location = 'about:blank';
                // window.close();
            }
        });
    },

    /**
     * Submit corrections back to Rodan.  If there are any corrections, run Gamera
     * and quit.  Otherwise, just quit.
     */
    finalizeAndQuit: function ()
    {
        console.log("FINALIZE AND QUIT!");

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

                // Close the window
                // window.close();
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
            title: "Loading Page...",
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
            title: "Submit Corrections...",
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
            title: "Finalize Corrections...",
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
