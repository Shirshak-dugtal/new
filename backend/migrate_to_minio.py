import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import boto3
from core.models import Session

import os
import boto3
from core.models import Session

BUCKET = 'session-images'

# Connect to MinIO
s3 = boto3.client(
    's3',
    endpoint_url='http://minio:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin'
)

sessions = Session.objects.filter(image__isnull=False)
print(f"Found {sessions.count()} sessions with images")

for session in sessions:
    old_path = session.image.name
    filename = os.path.basename(old_path)
    print(f"Processing {old_path}")
    local_paths = [f'/app/media/{old_path}', f'/app/media/session-images/{filename}']
    local_file = next((p for p in local_paths if os.path.exists(p)), None)
    uploaded = False

    if local_file:
        # Upload local file to bucket root
        with open(local_file, 'rb') as fh:
            s3.put_object(
                Bucket=BUCKET,
                Key=filename,
                Body=fh,
                ACL='public-read'
            )
        uploaded = True
    else:
        # Try copying existing object that might include session-images/ prefix
        existing_key = old_path.lstrip('/')
        if existing_key != filename:
            try:
                s3.copy_object(
                    Bucket=BUCKET,
                    Key=filename,
                    CopySource={'Bucket': BUCKET, 'Key': existing_key},
                    ACL='public-read'
                )
                s3.delete_object(Bucket=BUCKET, Key=existing_key)
                uploaded = True
            except s3.exceptions.NoSuchKey:
                print(f"Missing source object for {old_path}")
        else:
            try:
                s3.head_object(Bucket=BUCKET, Key=filename)
                uploaded = True
            except s3.exceptions.NoSuchKey:
                print(f"Missing object for {old_path}")

    if uploaded:
        session.image.name = filename
        session.save(update_fields=['image'])
        print(f"Normalized: {old_path} -> {filename}")

print('Migration complete!')
