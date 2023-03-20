import axios from 'axios';

// Finds manga with selected criteria and returns them in an array.
// returns maximum 50
export const Search = async (url: string, amount: number = 10) => {
    /**
     * Returns array of Manga objects.
     * 
     * @remarks
     * This function sends one request to the API
     * 
     * @param url - The formatted URL that will be fetched
     * @returns Array of Manga objects with type of any
     * 
     */
    const response: any = await axios.get(url);
    let mangaArr: any[] = [];

    if(response.status === 200) {
        let iterator: number = 0;
        response.data.forEach((manga: any) => {
            if(iterator < amount){
                mangaArr.push(manga);
                iterator++;
            }
        })
    }
    return mangaArr;
}

export const FindMangaByTitle = async (url: string) => {
    /**
     * Finds a manga with a given title.
     * 
     * @remarks
     * Will change to take a Title instead of URL in the future.
     * 
     * @param url - The formatted URL that will be fetched
     * @returns Data payload from the API - containing Manga information.
     */
    const response: any = await axios.get(url);
    if(response.status === 200){
        return response.data;
    } else{
        return null;
    }
}