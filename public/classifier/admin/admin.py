from django.contrib import admin
from classifier.models.glyph import Glyph
from classifier.models.image import Image
from classifier.models.page import Page


class ImageInline(admin.TabularInline):
    model = Image
class PageAdmin(admin.ModelAdmin):
    model = Page


class GlyphAdmin(admin.ModelAdmin):
    inlines = [
        ImageInline
    ]



admin.site.register(Glyph, GlyphAdmin)
admin.site.register(Page, PageAdmin)