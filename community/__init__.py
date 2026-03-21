default_app_config = 'community.apps.CommunityConfig'
from django.db.models.signals import post_save
print(f"Total señales: {len(post_save.receivers)}")