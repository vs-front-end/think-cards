const STORAGE_BATCH_SIZE = 100;

type StorageError = {
  message: string;
};

type StorageFile = {
  id: string | null;
  name: string;
};

type StorageResult<T> = Promise<{
  data: T | null;
  error: StorageError | null;
}>;

type StorageBucket = {
  list: (
    path: string,
    options: { limit: number; offset: number },
  ) => StorageResult<StorageFile[]>;
  remove: (paths: string[]) => StorageResult<StorageFile[]>;
};

export type StorageClient = {
  from: (bucket: string) => StorageBucket;
};

export async function removeUserFiles(
  storage: StorageClient,
  bucketName: string,
  userId: string,
): Promise<void> {
  const bucket = storage.from(bucketName);

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: STORAGE_BATCH_SIZE,
      offset: 0,
    });

    if (error) {
      throw new Error(`Could not list ${bucketName}: ${error.message}`);
    }

    if (!data?.length) return;

    const paths = data
      .filter((file) => file.id !== null)
      .map((file) => `${userId}/${file.name}`);

    if (paths.length !== data.length) {
      throw new Error(`Unexpected nested folder in ${bucketName}/${userId}`);
    }

    const { error: removeError } = await bucket.remove(paths);

    if (removeError) {
      throw new Error(`Could not clear ${bucketName}: ${removeError.message}`);
    }
  }
}
