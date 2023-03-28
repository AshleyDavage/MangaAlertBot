import axios from 'axios';

/**
 * Returns array of Manga objects.
 * 
 * @remarks
 * This function sends one request to the API example of expected url: /search?page=1&genres=action,comedy
 * 
 * @param url - The formatted URL that will be fetched
 * @returns Array of Manga objects with type of any
 * 
 */
export const FindMangasWithFilters = async (url: string, amount: number = 10) => {
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
 * @param url - The formatted URL that will be fetched
 * @returns Data payload from the API - containing Manga information.
 */
export const FindMangaByTitle = async (url: string) => {
    const response: any = await axios.get(url);
    if(response.status === 200){
        return response.data;
    } else{
        return null;
    }
}