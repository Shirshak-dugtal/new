#!/usr/bin/env python3
"""
MinIO Bucket Setup Script

This script creates the required buckets in MinIO for the Sessions Marketplace application.
Run this after docker-compose up to initialize MinIO storage.
"""

import boto3
from botocore.client import Config
import time

def setup_minio_buckets():
    """Create MinIO buckets if they don't exist"""
    
    # MinIO configuration
    MINIO_ENDPOINT = 'http://localhost:9000'
    ACCESS_KEY = 'minioadmin'
    SECRET_KEY = 'minioadmin'
    
    # Buckets to create
    BUCKETS = ['session-images', 'avatars']
    
    print("🗄️  Connecting to MinIO...")
    
    # Wait for MinIO to be ready
    max_retries = 10
    for i in range(max_retries):
        try:
            s3_client = boto3.client(
                's3',
                endpoint_url=MINIO_ENDPOINT,
                aws_access_key_id=ACCESS_KEY,
                aws_secret_access_key=SECRET_KEY,
                config=Config(signature_version='s3v4'),
                region_name='us-east-1'
            )
            s3_client.list_buckets()
            print("✅ Connected to MinIO")
            break
        except Exception as e:
            if i < max_retries - 1:
                print(f"⏳ Waiting for MinIO to be ready... ({i+1}/{max_retries})")
                time.sleep(3)
            else:
                print(f"❌ Failed to connect to MinIO: {e}")
                return False
    
    # Create buckets
    for bucket_name in BUCKETS:
        try:
            # Check if bucket exists
            s3_client.head_bucket(Bucket=bucket_name)
            print(f"✅ Bucket '{bucket_name}' already exists")
        except:
            # Bucket doesn't exist, create it
            try:
                s3_client.create_bucket(Bucket=bucket_name)
                
                # Set bucket policy to public-read
                bucket_policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                        }
                    ]
                }
                
                import json
                s3_client.put_bucket_policy(
                    Bucket=bucket_name,
                    Policy=json.dumps(bucket_policy)
                )
                
                print(f"✅ Created bucket '{bucket_name}' with public-read policy")
            except Exception as e:
                print(f"❌ Failed to create bucket '{bucket_name}': {e}")
                return False
    
    print("\n🎉 MinIO setup complete!")
    print(f"📊 MinIO Console: http://localhost:9001")
    print(f"   Username: {ACCESS_KEY}")
    print(f"   Password: {SECRET_KEY}")
    
    return True

if __name__ == "__main__":
    setup_minio_buckets()
