from rest_framework import routers

from django.urls import include, re_path

from .views import (CurrentUserView, FeatureSchemasViewSet, FeaturesViewSet,
                    GoogleMapsImportView, LogoutUserView, ManagementEventsView,
                    MapsViewSet, ProfileViewSet, UserViewSet, api_not_found)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profile', ProfileViewSet, 'ProfileViewSet')
router.register(r'maps', MapsViewSet, 'MapsViewSet')
router.register(r'features', FeaturesViewSet, 'FeaturesViewSet')
router.register(r'schemas', FeatureSchemasViewSet, 'FeatureSchemasViewSet')

# Need to set base_name because Reasons
# http://www.django-rest-framework.org/api-guide/routers/#usage (see note re `base_name`)
# http://stackoverflow.com/questions/22083090/what-base-name-parameter-do-i-need-in-my-route-to-make-this-django-api-work
# router.register(r'profile', ProfileViewSet, 'ProfileViewSet')

urlpatterns = [
    re_path(r'^0.1/', include(router.urls)),
    re_path(r'^0.1/googlemapsimport$', GoogleMapsImportView.as_view(), name='google-maps-import'),
    re_path(r'^0.1/management/events$', ManagementEventsView.as_view(), name='api-management-events'),
    re_path(r'^0.1/self$', CurrentUserView.as_view(), name='api-self'),
    re_path(r'^0.1/logout$', LogoutUserView.as_view(), name='api-logout'),
    # make sure that the API never serves up the react app
    re_path(r'^0.1/.*', api_not_found),
]
