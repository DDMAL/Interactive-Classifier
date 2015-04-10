(function($){
    "use strict";

    /*
    Global Variables
     */

    var SITE_URL = "/neumeeditor/";
    var SITE_SUBFOLDER = "neumeeditor/";
    var STATIC_URL = "/neumeeditor/media/";

    /*
    Boilerplate Code
     */

    // Enable CRSF in sync
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    var oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options){
        options.beforeSend = function(xhr){
            xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        };
        return oldSync(method, model, options);
    };

    /*
    Static functions
     */

    /**
     * Get the absolute url for a given glyph id.
     *
     * @static
     * @param id {int}
     * @returns {string}
     */
    function getAbsoluteGlyphUrl(id)
    {
        return SITE_URL + "glyph/" + String(parseInt(id)) + "/";
    }

    /*
    Router
    */
    var NeumeeditorRouter = Backbone.Marionette.AppRouter.extend({
        /* standard routes can be mixed with appRoutes/Controllers above */
        routes : {
            "neumeeditor/" : "openGlyphList",
            "neumeeditor/glyph/:id/" : "openGlyphEditor"
        },

        openGlyphList: function(){
            // Start the glyph list module
            App.module("GlyphList").start();
        },

        openGlyphEditor: function(id){
            // Start the glyph list module
            App.module("GlyphEdit").start();
            App.module("GlyphEdit").initializeId(id);
        },

        routeToPage: function(url) {
            var newPageUrl = SITE_SUBFOLDER + String(url).replace(/.*\/neumeeditor\//g, "");
            this.navigate(
                    // Strip site url if need be
                    newPageUrl,
                    {trigger: true}
                );
        }
    });

    /*
    App initialization
     */

    var App = new Backbone.Marionette.Application();
    var AppRouter = new NeumeeditorRouter();

    App.on('initialize:before', function(options)
    {
        // options.anotherThing = true; // Add more data to your options
    });
    App.on('initialize:after', function(options)
    {
    });
    App.on('start', function(options)
    {
        // Get history going
        Backbone.history.start({pushState: true});
    });

    App.addRegions({
        container: "#content",
        navigation: "#navigation"
    });




    /*  
    ------------------------------------------------------
    Models
    ------------------------------------------------------
    */

    var Image = Backbone.Model.extend({

        url: SITE_URL + "images/",

        defaults: {
            image_file: ""
        },

        initialize: function(options)
        {
            if (options !== undefined && options.url !== undefined)
            {
                this.url = String(options.url);
            }
        },

        /**
         * Get the absolute url to the image file.
         *
         * @returns {string}
         */
        getAbsoluteImageFile: function()
        {
            return STATIC_URL + this.get("image_file");
        }
    });

    var Name = Backbone.Model.extend({

        url: SITE_URL + "names/",

        defaults: {
            string: ""
        },

        initialize: function(options)
        {
            if (options !== undefined && options.url !== undefined)
            {
                this.url = String(options.url);
            }
        },

        /**
         * Set the Name's glyph based on the ID int.
         *
         * @param id
         */
        setGlyph: function(id)
        {
            this.set("glyph", getAbsoluteGlyphUrl(id));
        },

        /**
         * Set the model url to its url attribute.
         */
        transferUrl: function()
        {
            this.url = this.get("url");
        }
    });

    var Glyph = Backbone.Model.extend({

        urlRoot: SITE_URL + "glyphs/",

        //initialize: function(options)
        //{
        //    this.url = String(options.url);
        //},

        /**
         * Get a collection containing the Glyph's names.
         *
         * @param attributeName
         * @param CollectionType
         * @param ItemType
         * @returns {CollectionType}
         */
        // getCollection: function(attributeName, CollectionType, ItemType)
        // {
        //     var output = new CollectionType();
        //     var urlList = this.get(String(attributeName));
        //     if (urlList === undefined) {
        //         // This prevents crashing if the list is undefined.
        //         return undefined;
        //     }
        //     // If we don't encapsulate sort() in a function then we get errors on load.
        //     var sortOutput = function() {output.sort();};

        //     var newModel;
        //     for (var i = 0; i < urlList.length; i++)
        //     {
        //         newModel = new ItemType({url: String(urlList[i])});
        //         output.add(newModel);
        //         newModel.fetch({success: sortOutput});
        //     }
        //     return output;
        // },
        getCollection: function(attributeName, CollectionType, ItemType)
        {
            var collectionAttributes = this.get(String(attributeName));
            var collection = new CollectionType();
            collection.add(collectionAttributes);
            return collection;
        },

        defaults: {
            //id: 0,
            short_code: "",
            comments: ""
        }
    });


    /*  
    ------------------------------------------------------
    Collections
    ------------------------------------------------------
    */

    var NameCollection = Backbone.Collection.extend({
        model: Name,

        comparator: function(name)
        {
            // Newest names first
            return 0 - parseInt(name.get("id"));
        }
    });

    var ImageCollection = Backbone.Collection.extend({
        model: Image,

        comparator: function(image)
        {
            // Newest names first
            return 0 - parseInt(image.get("id"));
        }
    });

    var GlyphCollection = Backbone.Collection.extend({
        model: Glyph,

        initialize: function(options)
        {
            this.url = String(options.url);
        },

        comparator: function(image)
        {
            // Newest names first
            return 0 - parseInt(image.get("id"));
        }        
    });


    App.module("MainMenu", function(MainMenu, App, Backbone, Marionette, $, _) {
        this.startWithParent = true;

        /**
         * A generic link
         */
        var Link = Backbone.Model.extend({
            defaults: {
                url: "#",
                text: "Link"
            }
        });

        /** 
         * A link on the main menu.
         */
        var SingleMainMenuLinkView = Backbone.Marionette.ItemView.extend({
            template: "#single-main-menu-link-template",
            tagName: "li",

            events: {
                "click a": "goToUrl"
            },

            goToUrl: function(event) {
                event.preventDefault();
                AppRouter.routeToPage(event.target.href);
            }
        });

        /**
         * The main menu.
         */
        var MainMenuView = Backbone.Marionette.CompositeView.extend({
            childView: SingleMainMenuLinkView,
            childViewContainer: ".navbar-left",
            template: "#main-menu-template"
        });

        /*
        Execution Code
        */
        var menuLinks = new Backbone.Collection();
        menuLinks.add(new Link().set({url:SITE_URL + "", text: "Neumes"}));
        menuLinks.add(new Link().set({url:SITE_URL + "nomenclatures/", text: "Nomenclatures"}));
        menuLinks.add(new Link().set({url:SITE_URL + "styles/", text: "Styles"}));
        // menuLinks.add(new Link());
        // menuLinks.add(new Link());
        var menu = new MainMenuView({collection: menuLinks});
        App.navigation.show(menu);
    });

    App.module("Authentication", function(Authentication, App, Backbone, Marionette, $, _){
        this.startWithParent = false;
    });

    App.module("GlyphList", function(GlyphList, App, Backbone, Marionette, $, _){
        this.startWithParent = false;

        /*
        Item Views
        */

        var ImageView = Backbone.Marionette.ItemView.extend({
            template: "#single-image-template",

            tagName: "li",

            serializeData: function()
            {
                return {
                    "image_file": this.model.getAbsoluteImageFile()
                    // "image_file_absolute": this.model.getAbsoluteImageFile()
                };
            }
        });

        var NameView = Backbone.Marionette.ItemView.extend({
            template: "#single-name-template",

            tagName: "li"
        });

        var NameCollectionView = Backbone.Marionette.CollectionView.extend({
            childView: NameView,

            tagName: "ul"
        });

        var ImageCollectionView = Backbone.Marionette.CollectionView.extend({
            childView: ImageView,

            tagName: "ul"
        });

        var GlyphView = Backbone.Marionette.LayoutView.extend({
            template: "#glyph-template",
            tagName: "tr",

            regions: {
                names: ".glyph-name-list",
                images: ".glyph-image-list"
            },

            events: {
                "click .edit-button": "goToEdit"
            },

            goToEdit: function(event) {
                event.preventDefault();
                AppRouter.routeToPage(this.model.get("url"));
            },

            onShow: function() {
                var nameCollection = this.model.getCollection("name_set", NameCollection, Name);
                var imageCollection;
                try {
                    imageCollection = this.model.getCollection("image_set", ImageCollection, Image);
                }
                catch(ReferenceError) {
                    // Just make a blank collection
                    imageCollection = new ImageCollection();
                }
                this.names.show(new NameCollectionView({
                    collection: nameCollection
                }));
                this.images.show(new ImageCollectionView({
                    collection: imageCollection
                }));                       
            }
        });

        var GlyphCompositeView = Backbone.Marionette.CompositeView.extend({
            childView: GlyphView,

            childViewContainer: "tbody",
            template: "#glyph-collection-template"
        });

        var CreateGlyphView = Backbone.Marionette.ItemView.extend({
            /**
             * The collection that the new glyph will be added to.
             */
            createdCollection: undefined,
            template: "#create-glyph-template",
            tagName: 'form class="form" action="#"',

            ui: {
                "shortCodeField": "[name='glyph-short-code-field']",
                "statusDiv": ".status-message"
            },

            events: {
                "submit": "createGlyphButtonCallback"
            },

            initialize: function(createdCollection) {
                // The model is always a blank glyph
                this.generateNewEmptyGlyph();
                // Assign the collection which contains the created glyphs
                this.createdCollection = createdCollection;
            },

            generateNewEmptyGlyph: function() {
                this.model = new Glyph();
            },

            createGlyphButtonCallback: function(event)
            {
                // Prevent the event from redirecting the page
                event.preventDefault();
                // Flip the reference
                var newGlyph = this.model;
                var that = this;
                this.model.save(
                    {"short_code": this.ui.shortCodeField.val()},
                    {
                        success: function(event) {
                            that.ui.statusDiv.html('<p class="alert alert-success" role="alert">Glyph "<a href="' + newGlyph.get("url") + '">' + newGlyph.get("short_code") + '</a>" saved successfully.</p>');
                            //that.ui.statusDiv.find("p").fadeOut(5000);
                            // Add the created glyph to the createdCollection
                            that.createdCollection.add(newGlyph);
                            // Generate a new empty glyph
                            that.generateNewEmptyGlyph();
                            // Empty the short code field
                            that.ui.shortCodeField.val('');
                        },
                        error: function(event) {
                            that.ui.statusDiv.html('<p class="alert alert-danger" role="alert">Error saving glyph.<p>');
                            //that.ui.statusDiv.find("p").fadeOut(5000);
                        }
                    }
                );
                // Redirect to the edit page

            }
        });

        var GlyphDashboardView = Backbone.Marionette.LayoutView.extend({
            template: "#glyph-dashboard-template",

            regions: {
                glyphCreateRegion: ".glyph-create-region",
                glyphListRegion: ".glyph-list-region"
            },

            onShow: function() {
                var glyphCollection = new GlyphCollection({url: "/neumeeditor/glyphs/"});
                glyphCollection.fetch();
                this.glyphCreateRegion.show(new CreateGlyphView(glyphCollection));
                this.glyphListRegion.show(new GlyphCompositeView({collection: glyphCollection}));
            }
        });

        /*  
        ------------------------------------------------------
        Execution Code
        ------------------------------------------------------
        */

        this.start = function()
        {
            App.container.show(new GlyphDashboardView());
        };
    });

    App.module("GlyphEdit", function(GlyphEdit, App, Backbone, Marionette, $, _){
        this.startWithParent = false;

        /*  
        ------------------------------------------------------
        Views
        ------------------------------------------------------
        */

        /*
        Item Views
         */

        var EditSingleImageView = Backbone.Marionette.ItemView.extend({
            tagName: "div",

            template: _.template($('#edit-single-image-template').html()),

            modelEvents: {
                "change": "render"
            },

            events: {
                "click button[name='delete']": "destroyModel"
            },

            serializeData: function()
            {
                return {
                    "image_file": this.model.getAbsoluteImageFile()
                    // "image_file_absolute": this.model.getAbsoluteImageFile()
                };
            },

            destroyModel: function()
            {
                event.preventDefault();
                this.model.destroy();
                return this.trigger("destroy");
            }
        });

        /**
         * View for editing a single name object.
         */
        var EditSingleNameView = Backbone.Marionette.ItemView.extend({

            tagName: "form",

            template: _.template($('#edit-single-name-template').html()),

            modelEvents: {
                "change": "render"
            },

            events: {
                "submit": "submitModel",
                "click button[name='delete']": "destroyModel"
            },

            ui: {
                statusDiv: ".status-message"
            },

            submitModel: function(event)
            {
                // Prevent default functionality
                event.preventDefault();
                // Grab values from the form fields
                this.model.set({
                    string: String(this.$("input[name='string']").val())
                });
                var that = this;
                this.model.save(null,
                    {
                        success: function() {
                            that.ui.statusDiv.html("<p>Name saved successfully.</p>");
                            that.ui.statusDiv.find("p").fadeOut(2500);
                            return that.trigger("submit");
                        },
                        error: function() {
                            that.ui.statusDiv.html("<p>Error saving name.<p>");
                            that.ui.statusDiv.find("p").fadeOut(2500);
                        }
                    }
                );
            },

            destroyModel: function()
            {
                event.preventDefault();
                this.model.destroy();
                return this.trigger("destroy");
            }
        });

        var CreateImagesView = Backbone.Marionette.ItemView.extend({

            createdCollection: undefined,
            template: "#upload-image-template",
            dropzoneObject: undefined,

            ui: {
                "dropzone": ".dropzone-form"
            },

            initialize: function(options)
            {
                if(options !== undefined)
                {
                    if (options.createdCollection !== undefined)
                    {
                        console.log("There is a created collection.");
                        this.createdCollection = options.createdCollection;
                    }
                    if (options.glyphId !== undefined)
                    {
                        this.setGlyphId(options.glyphId);
                    }
                }
            },

            /**
             * Set the view glyph ID.
             *
             * @param idNum Glyph ID int,
             */
            setGlyphId: function(idNum)
            {
                this.glyphId = getAbsoluteGlyphUrl(parseInt(idNum));
            },

            onShow: function()
            {
                // Build the dropzone
                this.dropzoneObject = new Dropzone(this.ui.dropzone.selector,
                    {
                        url: SITE_URL + "images/",
                        autoProcessQueue: true,
                        paramName: "image_file",
                        acceptedFiles: "image/*",
                        headers: {
                            // We need to include the CSRF token again
                            "X-CSRFToken": csrftoken
                        },
                        params: {
                            glyph: this.glyphId
                        }
                    }
                );
                // Set up the callbacks
                var that = this;
                this.dropzoneObject.on("success",
                    function(file, attributes) {
                        var newModel = new Image({url: attributes.url});
                        newModel.set(attributes);
                        newModel.set("glyph", that.glyphId);
                        that.createdCollection.add(newModel);
                    }
                );
            }
        });

        var CreateSingleNameView = EditSingleNameView.extend({
            template: _.template($('#create-single-name-template').html())
        });

        /*
        Composite Views
        */

        var CreateNamesView = Backbone.Marionette.CompositeView.extend({

            emptyName: undefined,

            childView: CreateSingleNameView,

            childViewContainer: ".name-list",
            template: "#create-name-collection-template",

            childEvents: {
                "submit": "save"
            },

            initialize: function(options)
            {
                this.emptyName = new Name();
                if(options)
                {
                    if (options.createdCollection !== undefined)
                    {
                        this.createdCollection = options.createdCollection;
                    }
                    if (options.glyphId !== undefined)
                    {
                        this.emptyName.setGlyph(parseInt(options.glyphId));
                    }
                }
                this.collection = new NameCollection();
                this.collection.add(this.emptyName);
            },

            save: function(child)
            {
                // Remove model from this collection
                // Set the new URL
                child.model.transferUrl();
                this.createdCollection.add(child.model);
                this.collection.remove(child.model);
                this.collection.add(new Name());
            }
        });

        var EditNamesView = Backbone.Marionette.CompositeView.extend({
            childView: EditSingleNameView,

            childViewContainer: ".name-list",
            template: "#edit-name-collection-template"
        });

        var EditImagesView = Backbone.Marionette.CompositeView.extend({
            childView: EditSingleImageView,

            childViewContainer: ".images",
            template: "#edit-image-collection-template"
        });

        var EditSingleGlyphView = Backbone.Marionette.CompositeView.extend({
            tagName: "li",
            template: _.template("#edit-single-glyph-template")
        });


        /*
        Layout Views
        */

        var AppLayoutView = Backbone.Marionette.LayoutView.extend({
            template: "#edit-glyph-template",

            /*
            These regions correspond to template areas. They will be populated with
            sub views.
            */
            regions: {
                namesArea: ".names-area",
                nameCreateArea: ".name-create-area",
                imageUploadArea: ".image-upload-area",
                imagesEditArea: ".images-area",
                glyphPropertiesArea: ".glyph-properties-area"
            },

            modelEvents: {
                "change": "onChange"
            },

            events: {
                "click button[name='save-properties']": "saveProperties"
            },

            ui: {
                commentsBox: ".comments-box",
                statusDiv: ".property-status-message"
            },

            initialize: function()
            {
                this.glyphNames = new NameCollection();
                this.glyphImages = new ImageCollection();

                // Create the subViews
                this.editNamesView = new EditNamesView(
                    {collection: this.glyphNames}
                );
                this.createNamesView = new CreateNamesView({
                    glyphId: this.model.get("id"),
                    createdCollection: this.glyphNames
                });
                this.editImagesView = new EditImagesView({
                    collection: this.glyphImages
                });
                this.createImagesView = new CreateImagesView({
                    glyphId: this.model.get("id"),
                    createdCollection: this.glyphImages
                });

                // Load the names and images
                this.loadNamesAndImages();
            },

            saveProperties: function(event)
            {
                // Prevent default functionality
                event.preventDefault();
                var that = this;
                this.model.save(
                    {
                        comments: String(this.ui.commentsBox.val())
                    },
                    {
                        success: function() {
                            that.ui.statusDiv.html("<p>Properties updated successfully.</p>");
                            that.ui.statusDiv.find("p").fadeOut(2500);
                            return that.trigger("submit");
                        },
                        error: function() {
                            that.ui.statusDiv.html("<p>Error saving.<p>");
                            that.ui.statusDiv.find("p").fadeOut(2500);
                        }
                    }
                );
            },

            /**
             * Extract the names and images from the model.
             */
            loadNamesAndImages: function()
            {
                // Set the glyph ids on the child views
                this.createImagesView.setGlyphId(this.model.get("id"));
                // Load the models into the collections
                this.glyphNames.reset(this.model.get("name_set"));
                this.glyphImages.reset(this.model.get("image_set"));
            },

            onChange: function()
            {
                this.loadNamesAndImages();
                this.render();
            },

            onShow: function()
            {
                // Show the subviews
                this.namesArea.show(this.editNamesView,{ preventDestroy: true });
                this.nameCreateArea.show(this.createNamesView,{ preventDestroy: true });
                this.imagesEditArea.show(this.editImagesView,{ preventDestroy: true });
                this.imageUploadArea.show(this.createImagesView,{ preventDestroy: true });
            },

            onRender: function()
            {
                this.editNamesView.render();
                this.createNamesView.render();
                this.editImagesView.render();
                this.createImagesView.render();
            }

        });

        /*  
        ------------------------------------------------------
        Execution Code
        ------------------------------------------------------
        */

        var glyphId = 1;

        var glyph = new Glyph({
            url: "/neumeeditor/glyph/" + glyphId + "/"
        });

        //var editor;
        //
        //this.start = function() {
        //    editor = new AppLayoutView({model: glyph});
        //};
        
        this.initializeId = function(id)
        {
            glyphId = parseInt(id);
            glyph.url = "/neumeeditor/glyph/" + glyphId + "/";

            glyph.fetch({success: function() {
                // Build the main view
                var editor = new AppLayoutView({model: glyph});
                // Render the LayoutView
                // Glyph data loaded, so load the names, etc.
                editor.loadNamesAndImages();
                App.container.show(editor);
            }});
        };


    });
    App.start();

})(jQuery);
