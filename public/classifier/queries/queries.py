from classifier.models.glyph import Glyph


def reset_glyph_classifications(page_id):
    """
    Given a page ID, reset all machine-classified glyphs to "UNCLASSIFIED"
    """
    Glyph.objects.filter(
        page_id=page_id,
        id_state_manual=False
    ).update(
        short_code="UNCLASSIFIED",
        confidence=0.0
    )


def get_glyph_classes(page_id):
    # return Glyph.objects.filter(page_id=page_id, glyph_class__isnull=False).order_by("glyph_class__name").values_list("glyph_class__name", flat=True).distinct()
    return Glyph.objects.filter(page_id=page_id).order_by("short_code").values_list("short_code", flat=True).distinct()
