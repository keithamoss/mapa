from rest_framework import permissions

from django.contrib.auth.models import User


class IsAuthenticatedAndOwnsEntityPermissions(permissions.BasePermission):
    """
    Custom permission to check the user is the owner of the entity in question (map, schema, or feature)
    """

    def has_permission(self, request, view):
        entity = view.get_object()
        if isinstance(request.user, User) and request.user.is_authenticated is True and entity.owner_id.id == request.user.id:
            return True
        return False