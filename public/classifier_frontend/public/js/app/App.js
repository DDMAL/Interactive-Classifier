import Backbone from "backbone";
import Radio from "backbone.radio";
import Marionette from 'marionette';
import RootView from 'views/Root/RootView';
import MenuView from "views/MainMenu/MenuView";
import DashBoardView from "views/Dashboard/DashboardView";
import ModalView from "views/widgets/Modal/ModalView";
import ModalViewModel from "views/widgets/Modal/ModalViewModel";
import ModalCollectionView from "views/widgets/Modal/ModalCollectionView";
import LoadingScreenView from "views/widgets/LoadingScreen/LoadingScreenView";
import LoadingScreenViewModel from "views/widgets/LoadingScreen/LoadingScreenViewModel";
import Page from "models/Page";
//import GlyphDashboardView from "views/GlyphList/GlyphDashboardView";
import getCookie from "utils/getCookie";

var App = new Marionette.Application({

    modalCollection: undefined,


    behaviors: {
    },

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

        this.modalCollection = new Backbone.Collection();

        // Prepare the modal collection
        this.rootView.modal.show(new ModalCollectionView({
            collection: this.modalCollection
        }));

        // Loading modal
        var loadingModal = new ModalViewModel({
            id: "loading",
            title: "Loading Page...",
            isCloseable: false,
            innerView: new LoadingScreenView({
                model: new LoadingScreenViewModel({
                    text: "Loading page glyphs from the server.  This may take some time..."
                })
            })
        });
        this.modalCollection.add(loadingModal);
        // Guess All modal
        this.modalCollection.add(
            new ModalViewModel({
                id: "guessAll",
                title: "Guessing All Glyphs...",
                isCloseable: false,
                innerView: new LoadingScreenView({
                    model: new LoadingScreenViewModel({
                        text: "Gamera is currently guessing all glyph classifications.  This may take some time..."
                    })
                })
            })
        );
        var fileOpenModal = new ModalViewModel({
            id: "fileOpen",
            title: "Open File",
            isCloseable: true,
            innerView: new LoadingScreenView({
                model: new LoadingScreenViewModel({
                    text: "To implement..."
                })
            })
        });
        this.modalCollection.add(fileOpenModal);

        var fileSaveModal = new ModalViewModel({
            id: "fileSave",
            title: "Save File",
            isCloseable: true,
            innerView: new LoadingScreenView({
                model: new LoadingScreenViewModel({
                    text: "To implement..."
                })
            })
        });
        this.modalCollection.add(fileSaveModal);

        var that = this;
        // Menuchannel
        var menuChannel = Radio.channel("menu");
        menuChannel.on("click:file:open",
            function()
            {
                fileOpenModal.open();
            }
        );
        menuChannel.on("click:file:save",
            function()
            {
                fileSaveModal.open();
            }
        );
    },

    showNavigation: function(view)
    {
        console.log(this.rootView);
        this.rootView.navigation.show(view);
    },

    editPage: function(id)
    {
        var loadingModal = this.modalCollection.get("loading");
        loadingModal.open();

        var page = new Page();
        page.url = "/page/" + parseInt(id) + "/";
        console.log(page);
        var that = this;
        page.fetch(
            {
                "success": function()
                {
                    console.log("success");
                    that.rootView.container.show(new DashBoardView({model: page}));
                    loadingModal.close();
                }
            }
        );

        // Menuchannel
        var menuChannel = Radio.channel("menu");
        menuChannel.on("click:guess:all",
            function()
            {
                var guessAllModal = that.modalCollection.get("guessAll");
                guessAllModal.open();

                page.guessAll(function()
                {
                    guessAllModal.close();
                    that.editPage(page.get("id"));
                });
            }
        );
    }
});

App.on('initialize:before', function()
{
    // options.anotherThing = true; // Add more data to your options
});
App.on('initialize:after', function()
{
});

console.log(App);

export default App;
