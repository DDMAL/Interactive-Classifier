from django.contrib import admin
from classifier.models.glyph import Glyph
from classifier.models.page import Page


class PageAdmin(admin.ModelAdmin):
    model = Page


class GlyphAdmin(admin.ModelAdmin):
    model = Glyph


admin.site.register(Glyph, GlyphAdmin)
admin.site.register(Page, PageAdmin)