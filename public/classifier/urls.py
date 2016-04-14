from django.conf.urls import patterns, url
from django.conf import settings
from django.conf.urls.static import static
from classifier.views.authentication import ObtainExpiringAuthToken
from classifier.views.file_upload import GameraXMLUploadView, MEIUploadView, \
    ImageUploadView
from classifier.views.gamera_classifier import ClassifierList, ClassifierDetail
from classifier.views.gamera_classify import GameraClassifyAllView, \
    GameraResetAllView, GameraKNNSegmentationView
from classifier.views.main import neumeeditor_home, neumeeditor_api_root
from classifier.views.page import PageList, PageDetail, MyPageList, PageClasses, \
    PageStats
from rest_framework.urlpatterns import format_suffix_patterns
from classifier.views.glyph import GlyphDetail, GlyphList, \
    GlyphsByPageAndShortcode

urlpatterns = []

urlpatterns += format_suffix_patterns(
    patterns('views.main',
        url(r'^$', neumeeditor_home),
        url(r'^browse/$', neumeeditor_api_root),

         url(r'^classifiers/$', ClassifierList.as_view(), name="gameraclassifier-list"),
         url(r'^classifier/(?P<pk>[0-9]+)/$', ClassifierDetail.as_view(),
             name="gameraclassifier-detail"),

        url(r'^glyphs/$', GlyphList.as_view(), name="glyph-list"),
        url(r'^glyph/(?P<pk>[0-9]+)/$', GlyphDetail.as_view(),
        name="glyph-detail"),

        url(r'^pages/$', PageList.as_view(), name="page-list"),
        url(r'^pages/mine/$', MyPageList.as_view(), name="my-page-list"),


        url(r'^page/(?P<pk>[0-9]+)/$', PageDetail.as_view(), name="page-detail"),

        url(r'^page/(?P<pk>[0-9]+)/classes/$', PageClasses.as_view(), name="page-classes"),

        url(r'^page/(?P<pk>[0-9]+)/stats/$', PageStats.as_view(), name="page-stats"),

        url(r'^page/(?P<pk>[0-9]+)/guess/all/$', GameraClassifyAllView.as_view(), name="guess-all"),
        url(r'^page/(?P<pk>[0-9]+)/reset/all/$', GameraResetAllView.as_view(), name="reset-all"),

        url(r'^page/(?P<pk>[0-9]+)/classify/random/(?P<iter>[0-9]+)/$', GameraKNNSegmentationView.as_view(), name="classify-random"),

         url(r'^page/(?P<pk>[0-9]+)/glyphs/$', GlyphsByPageAndShortcode.as_view(), name="page-glyphs"),

        # File uploads
        url(r'^upload/gamera-xml/$',
            GameraXMLUploadView.as_view(),
            name="gamera-xml-upload"),

        url(r'^upload/mei/$',
            MEIUploadView.as_view(),
            name="mei-upload"),

        url(r'^upload/image/$',
            ImageUploadView.as_view(),
            name="image-upload")
    )
)

# Handle media
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Auth
urlpatterns += patterns('', url(r'^auth/', ObtainExpiringAuthToken.as_view()))
