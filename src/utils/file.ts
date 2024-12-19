import fsPromises from 'fs/promises';

/**
 * Ceeates the extension directory if it does not exist
 * @param storagePath 
 */
export const createStorageDirectory = async (storagePath: string) => {
    try {
        await fsPromises.mkdir(storagePath);
    } catch (err) {
        if ((<Error>err).message.includes('EEXIST')) {
            console.log(`createStorageDirectory:i01[MSG]Extension directory(${storagePath}) already exists`);
        } else {
            console.error(`createStorageDirectory:e01[MSG]Failed to create extension directory -> ${err}`);
        }
    }
};
