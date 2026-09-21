from app.services import (
    usage_service,
)


def test_usage_summary_uses_daily_limits(
    monkeypatch,
):
    counts = {
        "assistant": 3,
        "audio": 1,
        "realtime": 0,
    }

    def fake_get_usage_count(
        user_id,
        resource,
        window,
        bucket,
    ):
        assert user_id == "test-user"
        assert window == "DAY"

        return counts[resource]

    monkeypatch.setattr(
        usage_service,
        "_get_usage_count",
        fake_get_usage_count,
    )

    result = (
        usage_service
        .get_usage_summary(
            "test-user"
        )
    )

    usage = result["usage"]

    assert usage["assistant"] == {
        "used": 3,
        "limit": 20,
        "remaining": 17,
    }

    assert usage["audio"] == {
        "used": 1,
        "limit": 5,
        "remaining": 4,
    }

    assert usage["realtime"] == {
        "used": 0,
        "limit": 2,
        "remaining": 2,
    }


def test_request_quota_includes_global_limit(
    monkeypatch,
):
    captured = {}

    class FakeDynamoDBClient:
        def transact_write_items(
            self,
            **kwargs,
        ):
            captured.update(kwargs)

    monkeypatch.setattr(
        usage_service,
        "dynamodb_client",
        FakeDynamoDBClient(),
    )

    usage_service.consume_request_quota(
        user_id="test-user",
        resource="assistant",
        minute_limit=4,
        daily_limit=20,
        global_daily_limit=60,
    )

    items = captured[
        "TransactItems"
    ]

    assert len(items) == 3

    user_minute = items[0][
        "Update"
    ]

    user_daily = items[1][
        "Update"
    ]

    global_daily = items[2][
        "Update"
    ]

    assert (
        user_minute["Key"]["pk"]["S"]
        == "USER#test-user"
    )

    assert (
        user_daily["Key"]["pk"]["S"]
        == "USER#test-user"
    )

    assert (
        global_daily["Key"]["pk"]["S"]
        == "GLOBAL#OPENAI"
    )

    assert (
        global_daily[
            "ExpressionAttributeValues"
        ][":limit"]["N"]
        == "60"
    )
