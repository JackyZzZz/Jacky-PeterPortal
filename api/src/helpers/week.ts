/**
 @module WeekHelper
*/

import fetch from 'node-fetch';
import cheerio, { CheerioAPI, Element } from 'cheerio';
import { COLLECTION_NAMES, setValue, getValue } from './mongo';
import { QuarterMapping, WeekData } from '../types/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


dayjs.extend(utc)
dayjs.extend(timezone)

const PACIFIC_TIME = 'America/Los_Angeles';
dayjs.tz.setDefault(PACIFIC_TIME);

const MONDAY = 1; // day index (sunday=0, ..., saturday=6)

/**
 * Get the current week and quarter. A display string is also provided.
 */
export function getWeek(): Promise<WeekData> {
    return new Promise(async resolve => {
        // current date
        let date = dayjs().tz();
        // current year
        let year = date.year();

        // check for current year to current year + 1
        let quarterMapping1 = await getQuarterMapping(year) as QuarterMapping;
        let potentialWeek = findWeek(date, quarterMapping1);
        // if the date lies within this page
        if (potentialWeek) {
            resolve(potentialWeek);
            return;
        }

        // check for current year - 1 to current year
        let quarterMapping2 = await getQuarterMapping(year - 1) as QuarterMapping;
        potentialWeek = findWeek(date, quarterMapping2);
        if (potentialWeek) {
            resolve(potentialWeek);
        }
        else {
            // date not in any school term, probably in break
            resolve({
                week: -1,
                quarter: 'N/A',
                display: 'Enjoy your break!😎',
            });
        }
    })
}

/**
 * 
 * @param date Today's date
 * @param quarterMapping Maps a quarter to its start and end date 
 * @returns Week description if it lies within the quarter
 */
function findWeek(date: dayjs.Dayjs, quarterMapping: QuarterMapping): WeekData {
    let result: WeekData = undefined!;
    // iterate through each quarter
    Object.keys(quarterMapping).forEach(function (quarter) {
        let beginDate = new Date(quarterMapping[quarter]['begin']);
        let endDate = new Date(quarterMapping[quarter]['end']);

        let begin: dayjs.Dayjs;
        let end: dayjs.Dayjs;

        // begin/end dates are incorrectly in UTC+0, likely due to AWS servers being in UTC+0 by default
        // so for example, Winter 2023 starts on Monday Jan 9, 2023 PST
        // the begin date on production is incorrectly Jan 9, 2023 00:00 UTC+0, when it should be
        // Jan 9, 2023 0:00 UTC-8 (since Irvine is in PST which is 8 hours behind UTC)
        // we want to fix this offset for accurate comparsions
        if (beginDate.getUTCHours() === 0) {
            begin = dayjs.tz(beginDate.toISOString());
            end = dayjs.tz(endDate.toISOString());
        } else { // default case if the dates aren't in UTC+0 and are in correct timezone
            begin = dayjs(beginDate).tz();
            end = dayjs(endDate).tz();
        }

        // adjust instruction end date to the beginning of the following day
        end = end.add(1, 'day');

        // moves day back to Monday (if it isn't already such as in fall quarter which starts on a Thursday)
        // so that each new week starts on a Monday (rather than on Thursday as it was incorrectly calculating for fall quarter)
        begin = begin.day(MONDAY); 

        // check if the date lies within the start/end range
        if (date >= begin && date < end) {
            let isFallQuarter = quarter.toLowerCase().includes('fall');
            let week = Math.floor(date.diff(begin, 'weeks')) + (isFallQuarter ? 0 : 1); // if it's fall quarter, start counting at week 0, otherwise 1
            let display = `Week ${week} • ${quarter}`
            result = {
                week: week,
                quarter: quarter,
                display: display
            }
        }
        // check if date is after instruction end date and by no more than 1 week - finals week
        else if (date >= end && date < end.add(1, 'week')) {
            let display = `Finals Week • ${quarter}. Good Luck!🤞`
            result = {
                week: -1,
                quarter: quarter,
                display: display
            }
        }
    });
    return result;
}

/**
 * Given a year, get quarter to date range mapping
 * @param year Academic year to search for
 * @returns Mapping of quarters to its start and end date 
 */
async function getQuarterMapping(year: number): Promise<QuarterMapping> {
    return new Promise(async resolve => {
        // check if is in the cache
        let cacheKey = `quarterMapping${year}`
        let cacheValue = await getValue(COLLECTION_NAMES.SCHEDULE, cacheKey)
        if (cacheValue) {
            resolve(cacheValue);
            return;
        }
        // maps quarter description to day range
        let quarterToDayMapping = {}
        // url to academic calendar
        let url = `https://reg.uci.edu/calendars/quarterly/${year}-${year + 1}/quarterly${year % 100}-${(year % 100) + 1}.html`
        let res = await fetch(url);
        let text = await res.text();
        // scrape the calendar
        let $ = cheerio.load(text);
        // load all tables on the page
        let tables = $('table[class="calendartable"]').toArray()
        // process each table
        tables.forEach(table => {
            processTable(table, $, quarterToDayMapping, year);
        })
        await setValue(COLLECTION_NAMES.SCHEDULE, cacheKey, quarterToDayMapping);
        resolve(quarterToDayMapping);
    })
}

/**
 * Parses the quarter names from table labels and processes each row to find the start and end dates
 * @param table Cherio table element
 * @param $ Cherio command
 * @param quarterToDayMapping Mapping to store data into
 * @param year Beginning academic year
 */
function processTable(table: Element, $: CheerioAPI, quarterToDayMapping: QuarterMapping, year: number) {
    // find the tbody
    let tbody = $(table).find('tbody');
    // reference all rows in the table
    let rows = tbody.find('tr').toArray() as Element[];
    // the first row has all the labels for the table
    let tableLabels = $(rows[0]).find('td').toArray() as Element[];
    rows.forEach(row => {
        // process each row
        processRow(row, $, quarterToDayMapping, tableLabels, year)
    });
}

/**
 * Checks if a row contains info on beginning or end date
 * @param row Cherio row element
 * @param $ Cherio command
 * @param quarterToDayMapping Mapping to store data into
 * @param tableLabels Column labels in the current table 
 * @param year Beginning academic year
 */
function processRow(row: Element, $: CheerioAPI, quarterToDayMapping: QuarterMapping, tableLabels: Element[], year: number) {
    // get all information from row
    let rowInfo = $(row).find('td').toArray()
    // start date
    if ($(rowInfo[0]).text() == 'Instruction begins') {
        // for each season
        for (let i = 1; i < 4; i++) {
            let dateEntry = $(rowInfo[i]).text()
            let dateLabel = strip($(tableLabels[i]).text());
            quarterToDayMapping[dateLabel] = { 'begin': processDate(dateEntry, dateLabel, year), 'end': new Date() };
        }
    }
    // end date
    else if ($(rowInfo[0]).text() == 'Instruction ends') {
        // for each season
        for (let i = 1; i < 4; i++) {
            let dateEntry = $(rowInfo[i]).text()
            let dateLabel = strip($(tableLabels[i]).text());
            quarterToDayMapping[dateLabel]['end'] = processDate(dateEntry, dateLabel, year);
        }
    }
}

/**
 * Form a date object based on data from the calendar
 * @example 
 * // returns Date(1/17/2020)
 * processDate('Jan 17', 'Winter 2020', 2019)
 * @example 
 * // returns Date(7/30/2021)
 * processDate('Jul 30', 'Summer Session 10WK', 2020)
 * @param dateEntry Date entry on the calendar
 * @param dateLabel Date label on the calendar
 * @param year Beginning academic year
 * @returns Date for the corresponding table entry
 */
function processDate(dateEntry: string, dateLabel: string, year: number): Date {
    let splitDateEntry = dateEntry.split(' ');
    let month = splitDateEntry[0];
    let day = splitDateEntry[1];
    let labelYear = dateLabel.split(' ')[1];
    // 'Winter 2020' => 2020, but 'Summer Session I' => Session
    // Exception for Summer Session
    let correctYear = isInteger(labelYear) ? parseInt(labelYear) : year + 1;

    return dayjs.tz(`${correctYear}-${month}-${day}`).toDate();
}

/**
 * Remove trailing/leading whitespace from string
 * @param str Original string
 * @returns New string with whitespace removed
 */
function strip(str: string): string {
    return str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if a number is an integer or not
 * @param num Number to test
 * @returns True if is an integer
 */
function isInteger(num: string): boolean {
    return !isNaN(parseInt(num, 10))
}