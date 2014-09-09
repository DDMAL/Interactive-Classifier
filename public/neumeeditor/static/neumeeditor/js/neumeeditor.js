(function($){
    "use strict";

    /*
    Global Variables
     */

    var SITE_URL = "http://localhost:8000/neumeeditor/";
    var STATIC_URL = "http://localhost:8000/neumeeditor/media/";

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
    App initialization
     */

    var App = new Backbone.Marionette.Application();

    App.on('initialize:before', function(options)
    {
        // options.anotherThing = true; // Add more data to your options
    });
    App.on('initialize:after', function(options)
    {
        // console.log('Initialization Finished');
    });
    App.on('start', function(options)
    {
        // Get history going
        Backbone.history.start();
    });

    // Create a region. It will control what's in the #container element.
    App.container = new Backbone.Marionette.Region
    ({
        el: "#container"
    });

    App.addRegions({
        container: "#container"
    });

    // Add a view to the region. It will automatically render immediately.
    //    region.show(new MyView());

    // Close out the view that's currently there and render a different view.
    //    region.show(new MyOtherView());

    // Close out the view and display nothing in #container.
    //    region.close();

    App.module("authentication", function(myModule, App, Backbone, Marionette, $, _){
        this.startWithParent = false;
    });

    App.module("glyphEdit", function(myModule, App, Backbone, Marionette, $, _){
        this.startWithParent = true;

        /*  
        ------------------------------------------------------
        Models
        ------------------------------------------------------
        */

        var Image = Backbone.Model.extend({
            initialize: function(options)
            {
                if (options !== undefined && options.url !== undefined)
                {
                    this.url = String(options.url);
                }
            },

            url: SITE_URL + "images/",

            defaults: {
                image_file: ""
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
            initialize: function(options)
            {
                if (options !== undefined && options.url !== undefined)
                {
                    this.url = String(options.url);
                }
            },

            url: SITE_URL + "names/",

            defaults: {
                string: "",
                short_code: ""
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

            initialize: function(options)
            {
                this.url = String(options.url);
            },

            /**
             * Get a collection containing the Glyph's names.
             *
             * @param attributeName
             * @param CollectionType
             * @param ItemType
             * @returns {CollectionType}
             */
            getCollection: function(attributeName, CollectionType, ItemType)
            {
                var output = new CollectionType();
                var urlList = this.get(String(attributeName));
                // If we don't encapsulate sort() in a function then we get errors on load.
                var sortOutput = function() {output.sort();};

                var newModel;
                for (var i = 0; i < urlList.length; i++)
                {
                    newModel = new ItemType({url: String(urlList[i])});
                    output.add(newModel);
                    newModel.fetch({success: sortOutput});
                }

                return output;
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


        /*  
        ------------------------------------------------------
        Views
        ------------------------------------------------------
        */

        /*
        Item Views
         */

        var CreateImagesView = Backbone.Marionette.ItemView.extend({
            createdCollection: undefined,
            childView: CreateSingleNameView,
            childViewContainer: ".name-list",
            template: "#upload-image-template",

            initialize: function(options)
            {
                if(options)
                {
                    if (options.createdCollection)
                    {
                        this.createdCollection = options.createdCollection;
                    }
                    if (options.glyphId)
                    {
                        this.glyphId = getAbsoluteGlyphUrl(options.glyphId);
                        console.log("DECLARING GLYPH ID: ", this);
                    }
                }
            },

            childEvents: {
                "submit": "save"
            },

            ui: {
                "dropzone": ".dropzone"
            },

            save: function(child)
            {
                console.log("SAVE CALLBACK:");
            },

            onRender: function()
            {
                console.log("Uploader render.");
                console.log(this.glyphId);
                this.dropzone = new Dropzone(this.ui.dropzone.selector,
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
                var that = this;
                this.listenTo(this.dropzone, "success",
                    function(file, attributes)
                    {
                        console.log("Creating image model...", that);
                        console.log(attributes);
                        console.log(file);
                        var newModel = new Image({url: attributes.url});
                        newModel.set(attributes);
                        console.log("childviewcontainer: ", that.childViewContainer);
                        newModel.set("glyph", that.glyphId);
                        console.log(that.createdCollection);
                        that.createdCollection.add(newModel);
                        newModel.save();
                        console.log(newModel);
                    }
                );
            }
        });

        var CreateSingleNameView = EditSingleNameView.extend({
            template: _.template($('#create-single-name-template').html())
        });

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
                    "image_file": this.model.get("image_file"),
                    "image_file_absolute": this.model.getAbsoluteImageFile()
                };
            },

            destroyModel: function()
            {
                console.log("Delete name.");
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
                    string: String(this.$("input[name='string']").val()),
                    short_code: String(this.$("input[name='short_code']").val())
                });
                var that = this;
                this.model.save(null,
                    {
                        success: function() {
                            console.log("Success.");
                            console.log(that.ui.statusDiv);
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
                console.log("Delete name.");
                event.preventDefault();
                this.model.destroy();
                return this.trigger("destroy");
            }
        });

        /**
         * View for looking at a single glyph object.
         */
        var SingleGlyphView = Backbone.Marionette.ItemView.extend({
            tagName: "li",
            template: _.template("")
        });

        /*
        Composite Views
        */

        var CreateNamesView = Backbone.Marionette.CompositeView.extend({

            initialize: function(options)
            {
                var emptyName = new Name();

                if(options)
                {
                    if (options.createdCollection)
                    {
                        this.createdCollection = options.createdCollection;
                    }
                    if (options.glyphId)
                    {
                        emptyName.setGlyph(parseInt(options.glyphId));
                    }
                }
                this.collection = new NameCollection();
                this.collection.add(emptyName);
            },

            childView: CreateSingleNameView,

            childViewContainer: ".name-list",
            template: "#create-name-collection-template",

            childEvents: {
                "submit": "save"
            },

            save: function(child)
            {
                console.log("SAVE CALLBACK:");
                // Remove model from this collection
                console.log(child.model);
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
        ------------------------------------------------------
        Execution Code
        ------------------------------------------------------
        */

        var glyph = new Glyph({url: "http://localhost:8000/neumeeditor/glyph/1/"});

        this.start = function()
        {
            console.log("Starting...");
            glyph.fetch({success: function(){
                var glyphNames = glyph.getCollection("name_set", NameCollection, Name);
                var glyphImages = glyph.getCollection("image_set", ImageCollection, Image);
                console.log(glyphNames);
                (new EditNamesView({
                    collection: glyphNames,
                    el: '.names-area'
                })).render();

                (new CreateNamesView({
                    glyphId: glyph.get("id"),
                    createdCollection: glyphNames,
                    el: '.name-create-area'
                })).render();

                (new CreateImagesView({
                    glyphId: 1,
                    createdCollection: glyphImages,
                    el: '.image-upload-area'
                })).render();

                (new EditImagesView({
                    collection: glyphImages,
                    el: '.images-area'
                })).render();

            }});
        };


    });
    console.log("start app");
    App.start();

})(jQuery);
