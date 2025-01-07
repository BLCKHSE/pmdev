import fsPromises from 'fs/promises';
import { getLogTimestamp } from './date';

/**
 * Ceeates the extension directory if it does not exist
 * @param storagePath 
 */
export const createStorageDirectory = async (storagePath: string) => {
    try {
        await fsPromises.mkdir(storagePath);
    } catch (err) {
        if ((<Error>err).message.includes('EEXIST')) {
            console.log(`${getLogTimestamp()}: createStorageDirectory:i01[MSG]Extension directory(${storagePath}) already exists`);
        } else {
            console.error(`${getLogTimestamp()}: createStorageDirectory:e01[MSG]Failed to create extension directory -> ${err}`);
        }
    }
};
