import * as FileSystem from 'expo-file-system';

/**
 * Copy a shared file to the app's document directory
 * @param sourcePath - The path from share intent
 * @param prefix - Optional prefix for the filename (e.g., 'receipt')
 * @returns The new path in the app's document directory
 */
export async function copySharedFileToAppDirectory(
    sourcePath: string,
    prefix: string = 'receipt'
): Promise<string> {
    try {
        // Extract file extension
        const fileExtension = sourcePath.split('.').pop() || 'jpg';

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const newFileName = `${prefix}_${timestamp}_${randomId}.${fileExtension}`;

        // Destination path in app's document directory
        const destinationPath = `${FileSystem.documentDirectory}${newFileName}`;

        // Copy the file
        await FileSystem.copyAsync({
            from: sourcePath,
            to: destinationPath,
        });

        console.log(`[FileHelper] Copied file from ${sourcePath} to ${destinationPath}`);
        return destinationPath;
    } catch (error) {
        console.error('[FileHelper] Error copying file:', error);
        throw error;
    }
}

/**
 * Delete a file from the app's document directory
 * @param filePath - The path to delete
 */
export async function deleteFile(filePath: string): Promise<void> {
    try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(filePath);
            console.log(`[FileHelper] Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error('[FileHelper] Error deleting file:', error);
        throw error;
    }
}

/**
 * Check if a file exists
 * @param filePath - The path to check
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        return fileInfo.exists;
    } catch (error) {
        console.error('[FileHelper] Error checking file existence:', error);
        return false;
    }
}
