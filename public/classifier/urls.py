from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from classifier.views.authentication import ObtainExpiringAuthToken
from classifier.views.file_upload import GameraXMLUploadView, MEIUploadView
from classifier.views.image import ImageList, ImageDetail
from classifier.views.main import neumeeditor_home, neumeeditor_api_root
from classifier.views.page import PageList, PageDetail
from rest_framework.urlpatterns import format_suffix_patterns
from classifier.views.glyph import GlyphDetail, GlyphList

urlpatterns = []

urlpatterns += format_suffix_patterns(
    patterns('views.main',
        url(r'^$', neumeeditor_home),
        url(r'^browse/$', neumeeditor_api_root),

        url(r'^glyphs/$', GlyphList.as_view(), name="glyph-list"),
        url(r'^glyph/(?P<pk>[0-9]+)/$', GlyphDetail.as_view(),
        name="glyph-detail"),
        url(r'^glyph/(?P<pk>[0-9]+)/images/$', GlyphImages.as_view(),
            name="glyph-images"),

        url(r'^images/$', ImageList.as_view(), name="image-list"),
        url(r'^image/(?P<pk>[0-9]+)/$', ImageDetail.as_view(),
            name="image-detail"),
        # url(r'^users/$', UserList.as_view(), name="user-list"),
        # url(r'^user/(?P<pk>[0-9]+)/$', UserDetail.as_view(),
        #     name="user-detail"),

        url(r'^pages/$', PageList.as_view(), name="page-list"),
        url(r'^page/(?P<pk>[0-9]+)/$', PageDetail.as_view(), name="page-detail"),

        # File uploads
        url(r'^upload/gamera-xml/$',
            GameraXMLUploadView.as_view(),
            name="gamera-xml-upload"),

        url(r'^upload/mei/$',
            MEIUploadView.as_view(),
            name="mei-upload")
             ),
)

# Handle media
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Auth
urlpatterns += patterns('', url(r'^auth/', ObtainExpiringAuthToken.as_view()))
