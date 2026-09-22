from fastapi import APIRouter

from app.api.routes.assistant import (
    router as assistant_router,
)
from app.api.routes.health import (
    router as health_router,
)
from app.api.routes.documents import (
    router as documents_router,
)
from app.api.routes.conversations import (
    router as conversations_router,
)
from app.api.routes.audio import (
    router as audio_router,
)
from app.api.routes.dashboard import (
    router as dashboard_router,
)
from app.api.routes.activity import (
    router as activity_router,
)
from app.api.routes.auth import (
    router as auth_router,
)
from app.api.routes.usage import (
    router as usage_router,
)
from app.api.routes.integrations import (
    router as integrations_router,
)

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(assistant_router)
api_router.include_router(documents_router)
api_router.include_router(conversations_router)
api_router.include_router(
    audio_router
)
api_router.include_router(
    dashboard_router
)
api_router.include_router(
    activity_router
)
api_router.include_router(
    auth_router
)
api_router.include_router(
    usage_router
)
api_router.include_router(
    integrations_router
)