import axios, { AxiosResponse } from 'axios';
import config from '../config.json';

/**
 * Returns array of Manga objects.
 * 
 * @remarks
 * This function sends one request to the API example of expected url: /search?page=1&genres=action,comedy
 * 
 * @param {string} url - The formatted URL that will be fetched
 * @param {number} amount - The amount of manga objects to return
 * @returns {any[]} Array of Manga objects with type of any
 * 
 */
export const FindMangasWithFilters = async (url: string, amount: number = 10): Promise<any[]> => {
    const response: any = await axios.get(url);
    let mangaArr: any[] = [];

    if(response.status === 200) {
        for(let i = 0; i < amount; i++){
            mangaArr.push(response.data[i]);
        }
    }
    return mangaArr;
}

/**
 * Finds a manga with a given title.
 * 
 * @remarks
 * Changed from URL to HID/Title slug, haven't tested many slugs so might not work for all comics.
 * 
 * @param {string} identifier - Either title slug or HID for manga.
 * @returns {any} Data payload from the API - containing Manga information.
 */
export const FindMangaByTitle = async (identifier: string): Promise<any | null> => {
    let response: any;

    try{
        response = await axios.get(config.API_URL + `comic/${identifier}?tachiyomi=true`);
    } catch (err){
        console.error(err);
    }
    if(response.status === 200){
        return response.data;
    } else{
        return null;
    }
}