from enum import Enum


class EnumBase(Enum):
    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)


class ProfileSettings(str, EnumBase):
    LastMapId = "last_map_id"


class GeomType(str, EnumBase):
    POINT = "Point"

    def __str__(self):
        return self.value
