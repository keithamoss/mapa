import cairosvg

filename="_fruits/_processed/fruits1/coloured/001-apple.svg" #original file
output_file="001-apple-scaled.svg"

# Change = open(filename, "r")
# data = Change.read()
# data = data.replace('<svg ', '<svg preserveAspectRatio="none" ')
# Change.close()

# Change = open(filename, "w+")
# Change.write(data)
# Change.close()

cairosvg.svg2svg(url=filename, write_to=output_file, output_width=700,output_height=700)

# ########################

# import sys

# import svgutils.transform as sg

# fig = sg.fromfile("_fruits/_processed/fruits1/coloured/001-apple.svg")
# svg = fig.getroot()
# print(svg)
# # fig.scale_xy(.1, .1)
# # exit()

# # print(fig.get_size())
# # fig.set_size(('200','200'))
# # print(fig.get_size())
# fig.save("001-apple-scaled.svg")

# ##########################

# from svgelements import SVG, Matrix, SVGElement
# from svgelements.svgelements import Viewbox

# svg = SVG.parse("_fruits/_processed/fruits1/coloured/001-apple.svg")
# print(type(svg.viewbox))
# element = {
#     "x": 0, "y": 0, "width": 512, "height": 512
# }
# # print(element)
# e = SVGElement(element)
# # print(e)
# e.x = 0
# e.y = 0
# e.width = 612
# e.height = 612
# scale = svg.viewbox.transform(e)
# print(scale)
# # print(svg.string_xml())
# # print(svg.viewbox.scale)
# # svg2 = svg * Matrix(scale)
# svg2 = SVG.parse("_fruits/_processed/fruits1/coloured/001-apple.svg", transform="scale(1.1953125, 1.1953125)")
# svg2.write_xml("001-apple-scaled.svg")