from django.contrib import admin
from classifier.models.name import Name
from classifier.models.glyph import Glyph
from classifier.models.image import Image
from classifier.models.name_nomenclature_membership import \
    NameNomenclatureMembership
from classifier.models.style import Style
from classifier.models.nomenclature import Nomenclature


class NameInline(admin.TabularInline):
    model = Name


class ImageInline(admin.TabularInline):
    model = Image


class GlyphAdmin(admin.ModelAdmin):
    inlines = [
        NameInline,
        ImageInline
    ]


class StyleAdmin(admin.ModelAdmin):
    pass


class NameAdmin(admin.ModelAdmin):
    pass


class NomenclatureAdmin(admin.ModelAdmin):
    pass


class NameNomenclatureMembershipAdmin(admin.ModelAdmin):
    pass


admin.site.register(Glyph, GlyphAdmin)
admin.site.register(Style, StyleAdmin)
admin.site.register(Name, NameAdmin)
admin.site.register(Nomenclature, NomenclatureAdmin)
admin.site.register(NameNomenclatureMembership, NameNomenclatureMembershipAdmin)
