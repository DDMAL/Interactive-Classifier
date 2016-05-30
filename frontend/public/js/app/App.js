import $ from "jquery";
import Backbone from "backbone";
import RadioChannels from "radio/RadioChannels";
import Marionette from "marionette";
import RootView from "views/Root/RootView";
import MenuView from "views/MainMenu/MenuView";
import RodanDashboardView from "views/RodanDashboard/RodanDashboardView";
import ModalViewModel from "views/widgets/Modal/ModalViewModel";
import ModalCollectionView from "views/widgets/Modal/ModalCollectionView";
import LoadingScreenView from "views/widgets/LoadingScreen/LoadingScreenView";
import LoadingScreenViewModel from "views/widgets/LoadingScreen/LoadingScreenViewModel";
import GlyphEvents from "events/GlyphEvents";
import ModalEvents from "events/ModalEvents";
import MainMenuEvents from "events/MainMenuEvents";
import GlyphCollection from "collections/GlyphCollection";
import ConfirmView from "views/widgets/Confirm/ConfirmView";
import ConfirmViewModel from "views/widgets/Confirm/ConfirmViewModel";
import Strings from "localization/Strings";
import Timer from "utils/Timer";
import Authenticator from "auth/Authenticator";

/**
 * App is the Interactive Classifier application.
 */
var App = new Marionette.Application({
    modals: {},
    modalCollection: undefined,
    behaviors: {},
    changedGlyphs: new GlyphCollection(),

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
        this.listenTo(RadioChannels.menu, MainMenuEvents.clickFinalizeCorrections, function ()
        {
            that.modals.finalizeCorrections.open();
        });
        this.listenTo(RadioChannels.edit, GlyphEvents.changeGlyph, function (glyphModel)
        {
            that.changedGlyphs.add(glyphModel);
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
        var data = JSON.stringify({"glyphs": this.changedGlyphs.toJSON()});
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
            "glyphs": this.changedGlyphs.toJSON()
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

export default App;
