import csv
from django.core.management.base import BaseCommand
from settings import BASE_DIR
from classifier.helpers.importers.gamera_xml_importer import import_gamera_file


class Command(BaseCommand):
    args = ""

    def handle(self, *args, **kwargs):
        file_name = "390_020"
        import_gamera_file(BASE_DIR + "/data_dumps/{0}".format(file_name))
        print("GameraXML file {0} imported.".format(file_name))
