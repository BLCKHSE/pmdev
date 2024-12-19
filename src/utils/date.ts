/**
 * Date related helper functions
 */

const secs = 1000;
const mins = secs * 60;
const hours = mins * 60;
const days = hours* 24;
const weeks = days * 7;
const months = weeks * 4;
const years = months * 12; 

/**
 * Gets datetime string for log entries
 * @returns date string
 */
export const getLogTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Gets string representation of period between currenct date and a provided one
 * @param date 
 * @returns 
 */
export const getLastUpdated = (date: Date): string => {
    const period: number = new Date().getTime() - new Date(date).getTime();
    if (period < 0) {
        console.error(`${getLogTimestamp()}getLastUpdated:e01[MSG]Invalid date provided`);
        return '';
    }
    let lastUpdated = 'Just Now';
    if (period >= mins && period < hours) {
        let val = Number.parseInt(`${period/mins}`);
        lastUpdated = `${val} hour${val > 1 ? 's' : ''}`;
    } else if (period >= hours && period < days) {
        let val = Number.parseInt(`${period/hours}`);
        lastUpdated = `${val} day${val > 1 ? 's' : ''}`;
    } else if (period >= days && period < weeks) {
        let val = Number.parseInt(`${period/days}`);
        lastUpdated = `${val} week${val > 1 ? 's' : ''}`;
    } else if (period >= weeks && period < months) {
        let val = Number.parseInt(`${period/weeks}`);
        lastUpdated = `${val} month${val > 1 ? 's' : ''}`;
    } else if (period >= months && period < years) {
        let val = Number.parseInt(`${period/months}`);
        lastUpdated = `${val} year${val > 1 ? 's' : ''}`;
    } else if (period >= years){
        let val = Number.parseInt(`${period/years}`);
        lastUpdated = `${val} year${val > 1 ? 's' : ''}, ${period % years} months`;
    }
    return lastUpdated;
};
