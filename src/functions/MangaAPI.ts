import axios, { AxiosResponse } from 'axios';

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
 * Will change to take a Title instead of URL in the future.
 * 
 * @param {string} url - The formatted URL that will be fetched
 * @returns {AxiosResponse<any, any> | null} Data payload from the API - containing Manga information.
 */
export const FindMangaByTitle = async (url: string): Promise<AxiosResponse<any, any> | null> => {
    const response: AxiosResponse<any, any> = await axios.get(url);
    if(response.status === 200){
        return response.data;
    } else{
        return null;
    }
}