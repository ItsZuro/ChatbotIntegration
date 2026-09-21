import os


os.environ.setdefault(
    "AWS_ACCESS_KEY_ID",
    "testing",
)

os.environ.setdefault(
    "AWS_SECRET_ACCESS_KEY",
    "testing",
)

os.environ.setdefault(
    "AWS_SESSION_TOKEN",
    "testing",
)

os.environ.setdefault(
    "AWS_EC2_METADATA_DISABLED",
    "true",
)

os.environ.setdefault(
    "AWS_DEFAULT_REGION",
    "us-east-1",
)

os.environ.setdefault(
    "COGNITO_USER_POOL_ID",
    "us-east-1_test",
)

os.environ.setdefault(
    "COGNITO_CLIENT_ID",
    "test-client",
)

os.environ.setdefault(
    "DOCUMENTS_BUCKET_NAME",
    "test-bucket",
)
