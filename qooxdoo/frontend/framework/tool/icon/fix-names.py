#!/usr/bin/env python
# encoding: utf-8
"""
fix-names.py

Created by Fabian Jakobs on 2007-01-15.
Copyright (c) 2007 __MyCompanyName__. All rights reserved.
"""

import os
import sys
import getopt


help_message = '''
The help message goes here.
'''


class Usage(Exception):
    def __init__(self, msg):
        self.msg = msg

def get_migration_patch(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image, qx_icon_path, tango_icon_path):
	re = ""
	for qx in qx_to_tango_map:
		re += "\\b%s\\.png[\\\"\\']=%s.png\"\n" % (qx, qx_to_tango_map[qx])
	return re
		

def get_migration_info(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image, qx_icon_path, tango_icon_path):
	re = ""
	for qx in qx_not_in_tango:
		re += "\\b%s\\.png[\\\"\\']=The image '%s.png' is no longer supported!\n" % (qx, qx)

	re += "\n"

	for qx in qx_in_tango_without_image:
		re += "\\b%s\\.png[\\\"\\']=The image '%s.png' should be renamed to '%s' but currently no tango icon exists!\n" % (qx, qx, qx_in_tango_without_image[qx])

	return re
		

def get_html(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image, qx_icon_path, tango_icon_path):
	html = """
	<html>
	<body>
	%s
	</body>
	</html>
	"""
	qx_to_tango_table = """
	<h2>qooxdoo to Tango mapping</h2>
	<table>
	%s
	</table>
	"""
	rows = ""
	for qx in qx_to_tango_map:
		tango = qx_to_tango_map[qx]
		rows += "<tr><td><img src='%s/%s.png'></img>%s</td><td><img src='%s/%s.png'></img>%s</td></tr>\n" % (qx_icon_path, qx, qx, tango_icon_path, tango, tango)
	qx_to_tango_table = qx_to_tango_table % rows
		
	no_tango_icon_table = """
	<h2>qoxxdoo images tango equivalent but no tango icon</h2>
	<table>
	%s
	</table>
	"""
	rows = ""
	for qx in qx_in_tango_without_image:
		rows += "<tr><td><img src='%s/%s.png'></img>%s</td><td>%s</td></tr>\n" % (qx_icon_path, qx, qx, qx_in_tango_without_image[qx])
	no_tango_icon_table = no_tango_icon_table % rows

	no_tango_list = "<h2>qoxxdoo images without tango equivalent</h2>"
	for qx in qx_not_in_tango:
		no_tango_list += "<img src='%s/%s.png'></img>%s<br>\n" % (qx_icon_path, qx, qx)
		
	return html % (qx_to_tango_table + no_tango_icon_table + no_tango_list)

def print_migration(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image):
	pass

def search_tango(filename, path):
	for dirpath, dirs, files in os.walk(path):
		if filename + ".png" in files: return os.path.join(dirpath.split(os.sep)[-1], filename)
	return ""

def fix_names(qx_icon_path, tango_icon_path):
	qx_to_tango_map = {}
	qx_not_in_tango = []
	qx_in_tango_without_image = {}
	
	lines = open("qooxdoo_freedesktop.dat").readlines()
	for line in lines:
		line = line.strip();
		if line == "" or line[0] == "#": continue
		if not "=" in line: 
			qx_not_in_tango.append(qx)
			continue
			
		(qx, tango) = map(lambda x: x.strip(), line.split("="))

		if os.path.exists(os.path.join(tango_icon_path, tango + ".png")):
			qx_to_tango_map[qx] = tango
		else:
			qx_in_tango_without_image[qx] = tango

	return (
		qx_to_tango_map,
		qx_not_in_tango,
		qx_in_tango_without_image
	)

def main(argv=None):
    if argv is None:
        argv = sys.argv
    try:
        try:
            opts, args = getopt.getopt(argv[1:], "ho:v", ["help", "output="])
        except getopt.error, msg:
            raise Usage(msg)
    
        # option processing
        for option, value in opts:
            if option == "-v":
                verbose = True
            if option in ("-h", "--help"):
                raise Usage(help_message)
            if option in ("-o", "--output"):
                output = value

        qx_icon_path = "/Users/fabianpb/Desktop/icon-convert/qx/16"
        tango_icon_path = "/Users/fabianpb/opt/tango/share/icons/Tango/16x16"
        #tango_icon_path = "/Users/fabianpb/Desktop/icon-convert/tg/Tango/16x16"
        #tango_icon_path = "/Users/fabianpb/Desktop/icon-convert/fd/nuvola/16x16"
        (qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image) = fix_names(qx_icon_path, tango_icon_path)
        print get_html(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image, qx_icon_path, tango_icon_path)
        #print get_migration_info(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image, qx_icon_path, tango_icon_path)
        #print get_migration_patch(qx_to_tango_map, qx_not_in_tango, qx_in_tango_without_image, qx_icon_path, tango_icon_path)
        
    except Usage, err:
        print >> sys.stderr, sys.argv[0].split("/")[-1] + ": " + str(err.msg)
        print >> sys.stderr, "\t for help use --help"
        return 2


if __name__ == "__main__":
    sys.exit(main())
