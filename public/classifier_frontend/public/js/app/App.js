import $ from "jquery";
import Backbone from "backbone";
import Radio from "backbone.radio";
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
import getCookie from "utils/getCookie";
import GlyphCollection from "./collections/GlyphCollection";


var App = new Marionette.Application({

    modals: {},
    modalCollection: undefined,
    behaviors: {},

    changedGlyphs: new GlyphCollection(),

    onBeforeStart: function ()
    {
        // Get the CRSF token
        this.csrftoken = getCookie('csrftoken');
        var oldSync = Backbone.sync;
        Backbone.sync = function(method, model, options)
        {
            options.beforeSend = function(xhr)
            {
                xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
            };
            return oldSync(method, model, options);
        };
        // Instantiate the root view
        this.rootView = new RootView();
        this.rootView.navigation.show(new MenuView());

        // Create the modals
        this.initializeModals();

        // Menuchannel
        var that = this;
        var menuChannel = Radio.channel("menu");
        menuChannel.on(MainMenuEvents.clickSubmitCorrections,
            function()
            {
                that.submitCorrections()
            }
        );
        menuChannel.on(MainMenuEvents.clickFinalizeCorrections,
            function()
            {
                that.finalizeAndQuit();
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
            console.log("Change glyph!");
            console.log(glyphModel);
            that.changedGlyphs.add(glyphModel);
            console.log(that.changedGlyphs.toJSON());
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
            complete: function (response) {
                console.log("Complete", response);
                // window.location = 'about:blank';
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

        // TODO: Make a request back to the server
    },

    initializeModals: function()
    {
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
                    text: "Loading page glyphs from the server.  This may take some time..."
                })
            })
        });
        this.modalCollection.add(this.modals.loading);


        // Listen to the "closeAll" channel
        var that = this;
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
