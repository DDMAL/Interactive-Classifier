import Backbone from "backbone";
import Radio from "backbone.radio";
import RadioChannels from "radio/RadioChannels";
import Marionette from 'marionette';
import RootView from 'views/Root/RootView';
import MenuView from "views/MainMenu/MenuView";
import DashBoardView from "views/Dashboard/DashboardView";
import ModalViewModel from "views/widgets/Modal/ModalViewModel";
import ModalCollectionView from "views/widgets/Modal/ModalCollectionView";
import LoadingScreenView from "views/widgets/LoadingScreen/LoadingScreenView";
import LoadingScreenViewModel from "views/widgets/LoadingScreen/LoadingScreenViewModel";
import GameraXMLUploadView from "views/Upload/GameraXML/GameraXMLUploadView";
import FileOpenView from "views/FileOpen/FileOpenView";
import Page from "models/Page";
import ModalEvents from "events/ModalEvents";
import MainMenuEvents from "events/MainMenuEvents";
import getCookie from "utils/getCookie";
import WelcomeView from "views/Welcome/WelcomeView";
import UploaderViewModel from "views/Upload/GameraXML/UploaderViewModel";
import GameraClassifier from "./models/GameraClassifier";
import ClassifierDashboardView from "./views/ClassifierDashboard/ClassifierDashboardView";


var App = new Marionette.Application({

    modals: {},
    modalCollection: undefined,
    behaviors: {},

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
        menuChannel.on(MainMenuEvents.clickFileOpen,
            function()
            {
                that.modals.fileOpen.open();
            }
        );
        menuChannel.on(MainMenuEvents.clickGameraImport,
            function()
            {
                that.modals.gameraImport.open();
            }
        );
        menuChannel.on(MainMenuEvents.clickImageImport,
            function()
            {
                that.modals.imageImport.open();
            }
        );
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

        // Guess All modal
        this.modals.guessAll = new ModalViewModel({
            title: "Guessing All Glyphs...",
            isCloseable: false,
            innerView: new LoadingScreenView({
                model: new LoadingScreenViewModel({
                    text: "Gamera is currently guessing all glyph classifications.  This may take some time..."
                })
            })
        });
        this.modalCollection.add(this.modals.guessAll);

        // Reset All modal
        this.modals.resetAll = new ModalViewModel({
            title: "Resetting Glyph Classifications...",
            isCloseable: false,
            innerView: new LoadingScreenView({
                model: new LoadingScreenViewModel({
                    text: "All machine-classified glyphs will be reset to 'UNCLASSIFIED'..."
                })
            })
        });
        this.modalCollection.add(this.modals.resetAll);

        // File Open Modal
        this.modals.fileOpen = new ModalViewModel({
            title: "Open File",
            isCloseable: true,
            innerView: new FileOpenView()
        });
        this.modalCollection.add(this.modals.fileOpen);

        // File Save Modal
        this.modals.gameraImport = new ModalViewModel({
            title: "Import GameraXML File",
            isCloseable: true,
            innerView: new GameraXMLUploadView({
                model: new UploaderViewModel({
                    uploadUrl: "/upload/gamera-xml/",
                    successMessage: "GameraXML file uploaded successfully.",
                    progressMessage: "Analyzing GameraXML file...",
                    errorMessage: "Error in uploading and parsing GameraXML file"
                })
            })
        });
        this.modals.imageImport = new ModalViewModel({
            title: "Import Image File",
            isCloseable: true,
            innerView: new GameraXMLUploadView({
                model: new UploaderViewModel({
                    uploadUrl: "/upload/image/",
                    successMessage: "Image uploaded successfully.",
                    progressMessage: "Analyzing image file...",
                    errorMessage: "Error in uploading and analyzing image."
                })
            })
        });

        this.modalCollection.add(this.modals.gameraImport);
        this.modalCollection.add(this.modals.imageImport);

        // Listen to the "closeAll" channel
        var that = this;
        RadioChannels.modal.on(ModalEvents.closeAll,
            function ()
            {
                // Make sure all the modals are closed
                that.modalCollection.each(
                    function(modal)
                    {
                        modal.close();
                    }
                )
            }
        );
    },

    showNavigation: function(view)
    {
        this.rootView.navigation.show(view);
    },

    home: function()
    {
        this.rootView.container.show(new WelcomeView());
    },

    editPage: function(id)
    {
        this.modals.loading.open();

        var page = new Page();
        page.url = "/page/" + parseInt(id) + "/";

        var that = this;
        page.fetch(
            {
                "success": function()
                {
                    that.rootView.container.show(new DashBoardView({model: page}));
                    that.modals.loading.close();
                }
            }
        );

        // Menuchannel
        var menuChannel = Radio.channel("menu");
        menuChannel.on(MainMenuEvents.clickClassifierGuessAll,
            function()
            {
                that.modals.guessAll.open();

                page.guessAll(function()
                {
                    that.modals.guessAll.close();
                    that.editPage(page.get("id"));
                });
            }
        );
        menuChannel.on(MainMenuEvents.clickClassifierResetAll,
            function()
            {
                that.modals.resetAll.open();

                page.resetAll(function()
                {
                    that.modals.resetAll.close();
                    that.editPage(page.get("id"));
                });
            });
    },
    
    editClassifier: function (id)
    {
        console.log("editClassifier: " + id);
        
        var classifier = new GameraClassifier();
        classifier.url = "/classifier/" + parseInt(id) + "/";

        var that = this;
        classifier.fetch({success: function ()
        {
            that.rootView.container.show(new ClassifierDashboardView({
                model: classifier
            }));
        }});
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
