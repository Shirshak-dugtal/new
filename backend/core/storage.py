from storages.backends.s3boto3 import S3Boto3Storage


class MinIOMediaStorage(S3Boto3Storage):
    """Custom storage for MinIO"""
    location = ''  # store files at bucket root
    file_overwrite = False

    def url(self, name):
        """Always expose media URLs through nginx /media/ proxy"""
        name = name.lstrip('/')
        return f'/media/{name}'
