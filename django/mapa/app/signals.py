from mapa.app.models import Profile

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_user(sender, instance, created, **kwargs):
    if created:
        is_approved = True
        Profile.objects.create(user=instance, is_approved=is_approved)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()