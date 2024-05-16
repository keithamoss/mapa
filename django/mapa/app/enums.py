from enum import Enum


class EnumBase(Enum):
    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)


class ProfileSettings(str, EnumBase):
    LastMapId = "last_map_id"
    MapRenderer = "map_renderer"
    Basemap = "basemap"
    BasemapStyle = "basemap_style"
    QuickAddMode = "quick_add_mode"
    QuickAddSymbolCount = "quick_add_symbol_count"


class GeomType(str, EnumBase):
    POINT = "Point"

    def __str__(self):
        return self.value
