from rest_framework.routers import DefaultRouter
from .api_views import RankingViewset, WalkViewset, UserViewset

router = DefaultRouter()
router.register(r'ranking', RankingViewset)
router.register(r'ranking', WalkViewset)
router.register(r'ranking', UserViewset)

urlpatterns = router.urls