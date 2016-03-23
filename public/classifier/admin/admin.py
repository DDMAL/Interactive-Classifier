from django.contrib import admin
from classifier.models.glyph import Glyph
from classifier.models.image import Image


class ImageInline(admin.TabularInline):
    model = Image


class GlyphAdmin(admin.ModelAdmin):
    inlines = [
        ImageInline
    ]



admin.site.register(Glyph, GlyphAdmin)
