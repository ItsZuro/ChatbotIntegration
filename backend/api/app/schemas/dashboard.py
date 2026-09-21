from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    executed_actions: int
    conversations: int


class DashboardActivityItem(BaseModel):
    id: str
    title: str
    description: str
    integration: str
    status: str
    timestamp: str


class DashboardSummaryResponse(BaseModel):
    metrics: DashboardMetrics
    recent_activity: list[DashboardActivityItem]