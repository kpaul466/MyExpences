const BOUNDARY = '-------314159265358979323846';
const FILE_NAME = 'myexpense_backup.json';

export const googleDriveService = {
  async findBackupFile(accessToken: string) {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id, modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API Error (findBackupFile):', response.status, errorText);
      throw new Error(`Failed to find backup file: ${response.status}`);
    }
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  },

  async downloadBackup(accessToken: string, fileId: string) {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API Error (downloadBackup):', response.status, errorText);
      throw new Error(`Failed to download backup: ${response.status}`);
    }
    return await response.json();
  },

  async uploadBackup(accessToken: string, data: any, fileId?: string) {
    const metadata = {
      name: FILE_NAME,
      parents: fileId ? undefined : ['appDataFolder']
    };

    const body = `\r\n--${BOUNDARY}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${BOUNDARY}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${BOUNDARY}--`;

    const url = fileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

    const method = fileId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${BOUNDARY}`
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API Error (uploadBackup):', response.status, errorText);
      throw new Error(`Failed to upload backup: ${response.status}`);
    }
    return await response.json();
  }
};
